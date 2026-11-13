import React from "react";
import { AppData } from "../types";
import { DEFAULT_CATEGORIES } from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";
import { defaultStarterAccounts, seedData } from "./useBudgetStorage";

const safeNum = (val: unknown): number => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

interface UseDataVaultExportParams {
  data: AppData;
  commit: (next: AppData) => void;
  onNotify: (msg: string) => void;
}

export function useDataVaultExport({ data, commit, onNotify }: UseDataVaultExportParams) {
  const todayStr = getTodayStr();

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-next-step-budget-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify("Backup file saved to your device.");
  };

  const handleExportCsv = () => {
    const headers = ["Date", "Description", "Amount", "Account", "Category", "Type", "Source"];
    const rows = data.transactions.map((tx) => {
      const acc =
        data.accounts.find((a) => String(a.id) === String(tx.accountId))?.name || "Account";
      return [
        `"${tx.date}"`,
        `"${(tx.description || "").replace(/"/g, '""')}"`,
        tx.amount,
        `"${acc}"`,
        `"${tx.category || ""}"`,
        `"${tx.txType || ""}"`,
        `"${tx.source || ""}"`,
      ].join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-next-step-transactions-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify("Transaction ledger exported as CSV.");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => {
      onNotify("Failed to read backup file.");
    };
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (
          parsed &&
          typeof parsed === "object" &&
          Array.isArray(parsed.accounts) &&
          Array.isArray(parsed.transactions)
        ) {
          const importedSettings =
            parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {};
          commit({
            ...seedData,
            ...parsed,
            accounts: parsed.accounts.length ? parsed.accounts : defaultStarterAccounts,
            bills: Array.isArray(parsed.bills) ? parsed.bills : [],
            goals: Array.isArray(parsed.goals) ? parsed.goals : [],
            customCategories: Array.isArray(parsed.customCategories)
              ? parsed.customCategories
              : DEFAULT_CATEGORIES,
            merchantRules:
              parsed.merchantRules && typeof parsed.merchantRules === "object"
                ? parsed.merchantRules
                : {},
            settings: {
              ...seedData.settings,
              ...importedSettings,
              isPro: data.settings.isPro,
              proSource: data.settings.proSource,
              installDate: data.settings.installDate,
              ownershipSig: data.settings.ownershipSig,
              unlockedAt: data.settings.unlockedAt,
              payPeriod: {
                ...seedData.settings.payPeriod,
                ...(importedSettings.payPeriod && typeof importedSettings.payPeriod === "object"
                  ? importedSettings.payPeriod
                  : {}),
              },
            },
          });
          onNotify("Budget data successfully restored!");
        } else {
          onNotify("Invalid backup file format.");
        }
      } catch {
        onNotify("Failed to read backup file. Make sure it is a valid JSON backup.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportRawData = (rawText: string): boolean => {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.accounts)) {
        const importedSettings =
          parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {};
        commit({
          ...seedData,
          ...parsed,
          accounts: parsed.accounts.length ? parsed.accounts : defaultStarterAccounts,
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
          settings: {
            ...seedData.settings,
            ...importedSettings,
            isPro: data.settings.isPro,
            proSource: data.settings.proSource,
            installDate: data.settings.installDate,
            ownershipSig: data.settings.ownershipSig,
            unlockedAt: data.settings.unlockedAt,
            payPeriod: {
              ...seedData.settings.payPeriod,
              ...(importedSettings.payPeriod && typeof importedSettings.payPeriod === "object"
                ? importedSettings.payPeriod
                : {}),
            },
          },
        });
        onNotify("🎉 Budget data synced successfully!");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSlimLedger = (monthsOld: number = 6) => {
    const now = new Date();
    const targetMonthIndex = now.getMonth() - monthsOld;
    const targetYear = now.getFullYear() + Math.floor(targetMonthIndex / 12);
    const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
    const maxDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
    const cutoff = new Date(targetYear, normalizedMonth, Math.min(now.getDate(), maxDay), 12, 0, 0);
    const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;

    const oldTxs = data.transactions.filter((tx) => tx.date < cutoffStr);
    const keepTxs = data.transactions.filter((tx) => tx.date >= cutoffStr);

    if (oldTxs.length === 0) {
      onNotify(`No transactions older than ${monthsOld} months to slim.`);
      return;
    }

    const archiveData = {
      archiveCutoffDate: cutoffStr,
      archivedAt: todayStr,
      archivedTransactionCount: oldTxs.length,
      transactions: oldTxs,
      accounts: data.accounts,
    };
    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-archive-before-${cutoffStr}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const updatedAccounts = data.accounts.map((acc) => {
      const start = safeNum(acc.statementBalance);
      const rollFrom = acc.balanceDate || "0000-00-00";
      const nextBalanceDate =
        acc.balanceDate && acc.balanceDate > cutoffStr ? acc.balanceDate : cutoffStr;
      const oldSum =
        nextBalanceDate > rollFrom
          ? data.transactions
              .filter(
                (tx) =>
                  String(tx.accountId) === String(acc.id) &&
                  tx.date >= rollFrom &&
                  tx.date < nextBalanceDate
              )
              .reduce((sum, tx) => sum + safeNum(tx.amount), 0)
          : 0;
      return { ...acc, statementBalance: start + oldSum, balanceDate: nextBalanceDate };
    });

    commit({ ...data, accounts: updatedAccounts, transactions: keepTxs });
    onNotify(`⚡ Ledger slimmed! Archived ${oldTxs.length} old entries to file. Account balances remain 100% exact.`);
  };

  return {
    handleExportBackup,
    handleExportCsv,
    handleImportBackup,
    handleImportRawData,
    handleSlimLedger,
  };
}
