import { useState, useEffect, useCallback } from "react";
import { Account, AppData } from "../types";
import { DEFAULT_CATEGORIES } from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";
import {
  checkAndConsumeStripeRedirect,
  loadLicenseVault,
  saveLicenseVault,
} from "../utils/paywall";

const STORAGE_KEY = "the_next_step_budget_clean_engine_v2";

export const defaultStarterAccounts: Account[] = [
  { id: 1, name: "Checking", type: "Checking", statementBalance: 0, balanceDate: getTodayStr() },
  { id: 2, name: "Savings", type: "Savings", statementBalance: 0, balanceDate: getTodayStr() },
];

export const seedData: AppData = {
  accounts: defaultStarterAccounts,
  transactions: [],
  bills: [],
  goals: [],
  carriedForward: 0,
  merchantRules: {},
  customCategories: DEFAULT_CATEGORIES,
  settings: {
    theme: "light",
    hourlyRate: 0,
    showFutureYou: true,
    showRealityCheck: true,
    trackedHabitCategory: "Entertainment",
    installDate: getTodayStr(),
    isPro: false,
    swipeNav: false,
    largeText: false,
    reduceAnimations: false,
    payPeriod: {
      frequency: "biweekly",
      anchorDate: "2026-11-01",
    },
  },
};

export function useBudgetStorage(onNotify: (msg: string) => void) {
  const [data, setData] = useState<AppData>(() => {
    const vault = loadLicenseVault();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const initialSettings = {
          ...seedData.settings,
          isPro: vault.isPro || seedData.settings.isPro,
          proSource: vault.proSource || seedData.settings.proSource,
          installDate: vault.installDate || seedData.settings.installDate,
          ownershipSig: vault.ownershipSig,
          unlockedAt: vault.unlockedAt,
        };
        saveLicenseVault(initialSettings);
        return { ...seedData, settings: initialSettings };
      }
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid stored budget structure");
      }
      const rawRate = Number(parsed.settings?.hourlyRate);
      const parsedRate = Number.isFinite(rawRate) ? rawRate : 0;
      const mergedSettings = {
        ...seedData.settings,
        ...(parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {}),
        hourlyRate: parsedRate,
        isPro: Boolean(vault.isPro || parsed.settings?.isPro),
        proSource: parsed.settings?.proSource || vault.proSource,
        installDate: vault.installDate || parsed.settings?.installDate || getTodayStr(),
        ownershipSig: parsed.settings?.ownershipSig || vault.ownershipSig,
        unlockedAt: parsed.settings?.unlockedAt || vault.unlockedAt,
        payPeriod: {
          ...seedData.settings.payPeriod,
          ...(parsed.settings?.payPeriod && typeof parsed.settings.payPeriod === "object"
            ? parsed.settings.payPeriod
            : {}),
        },
      };
      saveLicenseVault(mergedSettings);
      return {
        ...seedData,
        ...parsed,
        accounts:
          Array.isArray(parsed.accounts) && parsed.accounts.length
            ? parsed.accounts
            : defaultStarterAccounts,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        bills: Array.isArray(parsed.bills) ? parsed.bills : [],
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        customCategories: Array.isArray(parsed.customCategories)
          ? parsed.customCategories
          : DEFAULT_CATEGORIES,
        merchantRules:
          parsed.merchantRules && typeof parsed.merchantRules === "object"
            ? parsed.merchantRules
            : {},
        settings: mergedSettings,
      };
    } catch (err) {
      console.error("Failed to load budget data from localStorage:", err);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) localStorage.setItem(`${STORAGE_KEY}_corrupt_backup`, raw);
      } catch {
        // Ignore backup storage failure
      }
      return {
        ...seedData,
        settings: {
          ...seedData.settings,
          isPro: vault.isPro,
          proSource: vault.proSource,
          installDate: vault.installDate || getTodayStr(),
          ownershipSig: vault.ownershipSig,
          unlockedAt: vault.unlockedAt,
        },
      };
    }
  });

  const commit = useCallback((next: AppData) => {
    const vault = saveLicenseVault(next.settings);
    const syncedNext: AppData = {
      ...next,
      settings: {
        ...next.settings,
        isPro: vault.isPro,
        proSource: vault.proSource || next.settings.proSource,
        installDate: vault.installDate || next.settings.installDate,
        ownershipSig: vault.ownershipSig || next.settings.ownershipSig,
        unlockedAt: vault.unlockedAt || next.settings.unlockedAt,
      },
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedNext));
    } catch (err) {
      console.error("Failed to save budget data to localStorage:", err);
      onNotify(
        "Warning: Browser storage is full or blocked. Export a JSON backup so you don't lose changes."
      );
    }
    setData(syncedNext);
  }, [onNotify]);

  useEffect(() => {
    void checkAndConsumeStripeRedirect().then((unlocked) => {
      if (unlocked) {
        const vault = loadLicenseVault();
        setData((prev) => {
          const updated: AppData = {
            ...prev,
            settings: {
              ...prev.settings,
              isPro: true,
              proSource: "purchased",
              ownershipSig: vault.ownershipSig,
              unlockedAt: vault.unlockedAt,
            },
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (err) {
            console.error("Failed to save Pro unlock to localStorage:", err);
          }
          return updated;
        });
        onNotify("🎉 Pro Lifetime Unlocked! All paywalls and ad banners have been permanently removed.");
      }
    });
  }, [onNotify]);

  return { data, commit };
}
