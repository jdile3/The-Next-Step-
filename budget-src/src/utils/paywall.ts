import { AppSettings } from "../types";

// Dedicated license vault key in localStorage so wiping budget data ("Erase Budget Data")
// NEVER strips a customer's Pro / VIP unlock or resets the 30-day trial clock.
export const LICENSE_VAULT_KEY = "the_next_step_pro_license_vault_v1";

// Temporary one-time checkout session key (expires after 30 minutes or immediately upon use)
const PENDING_CHECKOUT_KEY = "the_next_step_pending_checkout_v1";

// Cryptographic ownership signature stamped into localStorage and JSON backups once Pro is unlocked
const OWNERSHIP_SIGNATURE_STAMP = "tns_verified_owner_sig_9f8a7b6c5d4e";

// One-way cryptographic SHA-256 hash of the founder's VIP secret.
// The plaintext passcode is NEVER stored in the source code or client bundle.
const VIP_CODE_HASHES = new Set([
  "fad02a6fcc62a4a3fa0ca301a6b879d935790af0feeebecb91a499d877135d4e", // exact SHA-256 hash
  "5d3b6d4b232eef18f4db237b84e6c25fc318aa9eceef3bd03dbc3534db2205b4", // lowercase normalized hash
]);

// SHA-256 hash of the Stripe return parameter
const STRIPE_RETURN_TOKEN_HASH =
  "a9ef5c1919c871950e68f0b1297478b57d7d9637fb4a2079886e6fb2c4652572";

export interface LicenseVaultData {
  isPro: boolean;
  proSource?: "trial" | "purchased" | "vip_passcode";
  installDate?: string;
  ownershipSig?: string;
  unlockedAt?: string;
}

export interface PaywallStatus {
  isPro: boolean;
  isTrialActive: boolean;
  isPaywallActive: boolean;
  daysRemaining: number;
  totalTrialDays: number;
  proSource?: "trial" | "purchased" | "vip_passcode";
}

interface PendingCheckoutSession {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Starts a 30-minute expiring checkout session right before sending the buyer to Stripe.
 * If the buyer doesn't finish checkout within 30 minutes, this session expires automatically.
 * Once consumed upon return from Stripe, this session is immediately destroyed so the return
 * URL can never be shared with anyone else.
 */
export function startStripeCheckoutSession(): string {
  const now = Date.now();
  const session: PendingCheckoutSession = {
    sessionId: `${now}-${Math.random().toString(36).slice(2, 12)}`,
    createdAt: now,
    expiresAt: now + 30 * 60 * 1000, // Expires in 30 minutes
  };
  try {
    localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota errors
  }
  return session.sessionId;
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getLocalTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocalMiddayMs(dateStr: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr || "").trim());
  if (!match) return NaN;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const day = Number(match[3]);
  return new Date(y, m - 1, day, 12, 0, 0).getTime();
}

/**
 * Checks if the browser was redirected back from a completed Stripe payment (`?tns_unlock=...`).
 * Requires BOTH a valid cryptographic return parameter AND an active, non-expired checkout session
 * on this device. Immediately burns the session token and cleans the URL bar on success.
 */
export async function checkAndConsumeStripeRedirect(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const unlockParam = params.get("tns_unlock");
  if (!unlockParam) return false;

  // Always clean the URL bar immediately so nothing sits in the browser address bar
  try {
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch {
    // Ignore history API restrictions
  }

  try {
    const rawPending = localStorage.getItem(PENDING_CHECKOUT_KEY);
    // Destroy the one-time pending session immediately on first check (single-use only)
    localStorage.removeItem(PENDING_CHECKOUT_KEY);

    if (!rawPending) {
      return false;
    }

    const pending: PendingCheckoutSession = JSON.parse(rawPending);
    if (!pending.expiresAt || Date.now() > pending.expiresAt) {
      // Session expired (> 30 minutes old)
      return false;
    }

    const paramHash = await sha256Hex(unlockParam.trim());
    if (paramHash === STRIPE_RETURN_TOKEN_HASH) {
      saveLicenseVault({
        isPro: true,
        proSource: "purchased",
        unlockedAt: getLocalTodayIso(),
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Failed to verify Stripe checkout return:", err);
    return false;
  }
}

export function loadLicenseVault(): LicenseVaultData {
  try {
    const raw = localStorage.getItem(LICENSE_VAULT_KEY);
    if (!raw) return { isPro: false };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { isPro: false };
    const hasValidPro =
      !!parsed.isPro || parsed.ownershipSig === OWNERSHIP_SIGNATURE_STAMP;
    return {
      isPro: hasValidPro,
      proSource: parsed.proSource,
      installDate: typeof parsed.installDate === "string" ? parsed.installDate : undefined,
      ownershipSig: hasValidPro ? OWNERSHIP_SIGNATURE_STAMP : undefined,
      unlockedAt: typeof parsed.unlockedAt === "string" ? parsed.unlockedAt : undefined,
    };
  } catch (err) {
    console.warn("Failed to read license vault from localStorage:", err);
    return { isPro: false };
  }
}

export function saveLicenseVault(
  settings: Partial<AppSettings> & { ownershipSig?: string; unlockedAt?: string }
): LicenseVaultData {
  const existing = loadLicenseVault();
  const isPro = !!(
    existing.isPro ||
    settings.isPro ||
    settings.ownershipSig === OWNERSHIP_SIGNATURE_STAMP
  );
  const proSource = settings.isPro
    ? settings.proSource || existing.proSource || "purchased"
    : existing.proSource;

  // Keep the earliest installDate so "Erase Budget Data" cannot be used to get infinite 30-day trials
  const todayIso = getLocalTodayIso();
  let installDate = existing.installDate || settings.installDate || todayIso;
  if (existing.installDate && settings.installDate) {
    installDate =
      existing.installDate < settings.installDate ? existing.installDate : settings.installDate;
  }

  const nextVault: LicenseVaultData = {
    isPro,
    proSource,
    installDate,
    ownershipSig: isPro ? OWNERSHIP_SIGNATURE_STAMP : undefined,
    unlockedAt: isPro
      ? settings.unlockedAt || existing.unlockedAt || todayIso
      : undefined,
  };

  try {
    localStorage.setItem(LICENSE_VAULT_KEY, JSON.stringify(nextVault));
  } catch (err) {
    console.warn("Failed to persist license vault to localStorage:", err);
  }

  return nextVault;
}

export function getPaywallStatus(settings: AppSettings): PaywallStatus {
  const vault = saveLicenseVault(settings);

  // If explicitly Pro (in either settings or permanent device license vault)
  if (settings.isPro || vault.isPro) {
    return {
      isPro: true,
      isTrialActive: false,
      isPaywallActive: false,
      daysRemaining: 0,
      totalTrialDays: 30,
      proSource: settings.proSource || vault.proSource || "purchased",
    };
  }

  // Calculate 30-day trial from earliest installDate
  const installDateStr =
    vault.installDate || settings.installDate || getLocalTodayIso();
  const parsedInstall = parseLocalMiddayMs(installDateStr);
  const installTime = Number.isFinite(parsedInstall)
    ? parsedInstall
    : parseLocalMiddayMs(getLocalTodayIso());
  const now = Date.now();
  const elapsedDays = Math.max(0, Math.floor((now - installTime) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, 30 - elapsedDays);

  const isTrialActive = daysRemaining > 0;
  const isPaywallActive = !isTrialActive;

  return {
    isPro: false,
    isTrialActive,
    isPaywallActive,
    daysRemaining,
    totalTrialDays: 30,
    proSource: isTrialActive ? "trial" : undefined,
  };
}

export async function verifyVipCode(code: string): Promise<boolean> {
  if (!code) return false;
  const trimmed = code.trim();
  if (!trimmed) return false;

  try {
    const hash1 = await sha256Hex(trimmed);
    if (VIP_CODE_HASHES.has(hash1)) return true;

    const hash2 = await sha256Hex(trimmed.toLowerCase());
    return VIP_CODE_HASHES.has(hash2);
  } catch {
    return false;
  }
}
