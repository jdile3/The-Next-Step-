import { AppSettings } from '../types';

// Dedicated license vault key in localStorage so wiping budget data ("Erase Everything")
// NEVER strips a customer's Pro / VIP unlock or resets the 30-day trial clock.
export const LICENSE_VAULT_KEY = 'the_next_step_pro_license_vault_v1';

// One-way cryptographic SHA-256 hash of the founder's VIP secret.
// The plaintext passcode is NEVER stored in the source code or client bundle.
const VIP_CODE_HASHES = new Set([
  'fad02a6fcc62a4a3fa0ca301a6b879d935790af0feeebecb91a499d877135d4e', // exact SHA-256 hash
  '5d3b6d4b232eef18f4db237b84e6c25fc318aa9eceef3bd03dbc3534db2205b4', // lowercase normalized hash
]);

export interface LicenseVaultData {
  isPro: boolean;
  proSource?: 'trial' | 'purchased' | 'vip_passcode';
  installDate?: string;
}

export interface PaywallStatus {
  isPro: boolean;
  isTrialActive: boolean;
  isPaywallActive: boolean;
  daysRemaining: number;
  totalTrialDays: number;
  proSource?: 'trial' | 'purchased' | 'vip_passcode';
}

export function loadLicenseVault(): LicenseVaultData {
  try {
    const raw = localStorage.getItem(LICENSE_VAULT_KEY);
    if (!raw) return { isPro: false };
    const parsed = JSON.parse(raw);
    return {
      isPro: !!parsed.isPro,
      proSource: parsed.proSource,
      installDate: parsed.installDate,
    };
  } catch {
    return { isPro: false };
  }
}

export function saveLicenseVault(settings: Partial<AppSettings>): LicenseVaultData {
  const existing = loadLicenseVault();
  // Once Pro is unlocked on a device, keep it unlocked unless explicitly revoked
  const isPro = !!(existing.isPro || settings.isPro);
  const proSource = settings.isPro
    ? settings.proSource || existing.proSource || 'purchased'
    : existing.proSource;

  // Keep the earliest installDate so "Erase Everything" cannot be used to get infinite 30-day trials
  let installDate = existing.installDate || settings.installDate;
  if (existing.installDate && settings.installDate) {
    installDate =
      existing.installDate < settings.installDate ? existing.installDate : settings.installDate;
  }

  const nextVault: LicenseVaultData = {
    isPro,
    proSource,
    installDate,
  };

  try {
    localStorage.setItem(LICENSE_VAULT_KEY, JSON.stringify(nextVault));
  } catch {
    // Ignore storage quota errors
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
      proSource: settings.proSource || vault.proSource || 'purchased',
    };
  }

  // Calculate 30-day trial from earliest installDate
  const installDateStr =
    vault.installDate || settings.installDate || new Date().toISOString().slice(0, 10);
  const installTime = new Date(installDateStr).getTime();
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
    proSource: isTrialActive ? 'trial' : undefined,
  };
}

export async function verifyVipCode(code: string): Promise<boolean> {
  if (!code) return false;
  const trimmed = code.trim();
  if (!trimmed) return false;

  try {
    const encoder = new TextEncoder();

    // Check exact hash
    const buf1 = await crypto.subtle.digest('SHA-256', encoder.encode(trimmed));
    const hash1 = Array.from(new Uint8Array(buf1))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (VIP_CODE_HASHES.has(hash1)) return true;

    // Check case-insensitive hash
    const buf2 = await crypto.subtle.digest('SHA-256', encoder.encode(trimmed.toLowerCase()));
    const hash2 = Array.from(new Uint8Array(buf2))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return VIP_CODE_HASHES.has(hash2);
  } catch {
    return false;
  }
}
