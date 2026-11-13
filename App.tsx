import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Account,
  AppData,
  Bill,
  Goal,
  MoreSubPage,
  NavigationTab,
  Transaction,
} from "./types";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { HomeTab } from "./components/HomeTab";
import { TransactionsTab } from "./components/TransactionsTab";
import { CalendarTab } from "./components/CalendarTab";
import { AccountsTab } from "./components/AccountsTab";
import { MoreTab } from "./components/MoreTab";
import { CalculatorModal } from "./components/CalculatorModal";
import { PayPeriodConfigModal } from "./components/PayPeriodConfigModal";
import { ReceiptScannerModal } from "./components/ReceiptScannerModal";
import { CsvMachineModal } from "./components/CsvMachineModal";
import { TransactionModal } from "./components/TransactionModal";
import { BillModal } from "./components/BillModal";
import { GoalModal } from "./components/GoalModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { InstallAppModal } from "./components/InstallAppModal";
import { UpgradeModal } from "./components/UpgradeModal";
import {
  DEFAULT_CATEGORIES,
  detectDelimiter,
  formatMoney,
  merchantRuleKey,
  normalizeMerchant,
  splitCsvLine,
} from "./utils/money";
import {
  calculateCurrentPayPeriod,
  getBillsDueInPeriod,
  getTodayStr,
  monthKey,
} from "./utils/payPeriod";
import { getPaywallStatus, loadLicenseVault, saveLicenseVault } from "./utils/paywall";

const STORAGE_KEY = "the_next_step_budget_clean_engine_v2";

const defaultStarterAccounts: Account[] = [
  { id: 1, name: "Checking", type: "Checking", statementBalance: 0, balanceDate: getTodayStr() },
  { id: 2, name: "Savings", type: "Savings", statementBalance: 0, balanceDate: getTodayStr() },
];

const seedData: AppData = {
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

export default function App() {
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
        };
        saveLicenseVault(initialSettings);
        return { ...seedData, settings: initialSettings };
      }
      const parsed = JSON.parse(saved);
      const parsedRate =
        parsed.settings?.hourlyRate === 29.29 ? 0 : Number(parsed.settings?.hourlyRate) || 0;
      const mergedSettings = {
        ...seedData.settings,
        ...(parsed.settings || {}),
        hourlyRate: parsedRate,
        isPro: !!(vault.isPro || parsed.settings?.isPro),
        proSource: parsed.settings?.proSource || vault.proSource,
        installDate: vault.installDate || parsed.settings?.installDate || getTodayStr(),
        payPeriod: {
          ...seedData.settings.payPeriod,
          ...(parsed.settings?.payPeriod || {}),
        },
      };
      saveLicenseVault(mergedSettings);
      return {
        ...seedData,
        ...parsed,
        accounts: parsed.accounts?.length ? parsed.accounts : defaultStarterAccounts,
        settings: mergedSettings,
      };
    } catch {
      return {
        ...seedData,
        settings: {
          ...seedData.settings,
          isPro: vault.isPro,
          proSource: vault.proSource,
          installDate: vault.installDate || getTodayStr(),
        },
      };
    }
  });

  // Active navigation tab and sub-pages
  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [moreSubPage, setMoreSubPage] = useState<MoreSubPage>(null);

  // App Toast Notifications (Auto-dismisses in 3.5 seconds)
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification("");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Modals state
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isPayPeriodModalOpen, setIsPayPeriodModalOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installModalTab, setInstallModalTab] = useState<"cloud" | "android" | "windows" | "share">(
    "cloud"
  );
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleOpenSyncHub = () => {
    setInstallModalTab("cloud");
    setIsInstallModalOpen(true);
  };

  const handleOpenInstallApp = () => {
    setInstallModalTab("android");
    setIsInstallModalOpen(true);
  };

  const handleOpenShareApp = () => {
    setInstallModalTab("share");
    setIsInstallModalOpen(true);
  };

  // CSV Machine State
  const [csvData, setCsvData] = useState<{
    account: Account;
    fileName: string;
    rawLines: string[];
    delimiter: string;
    headers: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetCsvAccountRef = useRef<Account | null>(null);

  // Persist helper (Always syncs and preserves Pro / VIP status in the permanent license vault)
  const commit = (next: AppData) => {
    const vault = saveLicenseVault(next.settings);
    const syncedNext: AppData = {
      ...next,
      settings: {
        ...next.settings,
        isPro: vault.isPro,
        proSource: vault.proSource || next.settings.proSource,
        installDate: vault.installDate || next.settings.installDate,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedNext));
    setData(syncedNext);
  };

  const todayStr = getTodayStr();
  const curMonthKey = monthKey(todayStr);
  const currentDayOfMonth = parseInt(todayStr.split("-")[2], 10);

  // Paywall & Trial Status (30-day trial -> 2 accounts limit + gated extras)
  const paywallStatus = useMemo(() => {
    return getPaywallStatus(data.settings);
  }, [data.settings]);

  // Dynamic Pay Period auto-advancing calculation
  const currentPayPeriod = useMemo(() => {
    return calculateCurrentPayPeriod(data.settings.payPeriod, todayStr);
  }, [data.settings.payPeriod, todayStr]);

  // Combined categories
  const allCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    (data.customCategories || []).forEach((c) => {
      if (c?.trim()) set.add(c.trim());
    });
    data.transactions.forEach((t) => {
      if (t.category?.trim()) set.add(t.category.trim());
    });
    return Array.from(set);
  }, [data.customCategories, data.transactions]);

  // Account Balances
  const activeAccounts = data.accounts.filter((a) => !a.archived);
  const availableCash = useMemo(() => {
    return activeAccounts
      .filter((a) => ["Checking", "Savings", "Cash"].includes(a.type))
      .reduce((sum, a) => {
        const start = Number(a.statementBalance || 0);
        const txSum = data.transactions
          .filter(
            (tx) =>
              String(tx.accountId) === String(a.id) &&
              tx.date >= a.balanceDate &&
              tx.date <= todayStr
          )
          .reduce((acc, tx) => acc + Number(tx.amount), 0);
        return sum + start + txSum;
      }, 0);
  }, [activeAccounts, data.transactions, todayStr]);

  // Bills due in CURRENT PAY PERIOD
  const activeBills = useMemo(() => data.bills.filter((b) => !b.archived), [data.bills]);

  const periodBills = useMemo(() => {
    return getBillsDueInPeriod(activeBills, currentPayPeriod.startDate, currentPayPeriod.endDate);
  }, [activeBills, currentPayPeriod]);

  // Only subtract UNPAID bills in this period so paid bills (which already created a negative transaction in availableCash) are NEVER subtracted twice!
  const billsThisPeriodTotal = useMemo(() => {
    return periodBills
      .filter((item) => !item.bill.paidMonths?.[monthKey(item.specificDueDate)])
      .reduce((sum, item) => sum + Number(item.bill.amount), 0);
  }, [periodBills]);

  // Missed / Past-Due Bills this month (dueDay < currentDayOfMonth and not marked paid)
  const missedBills = useMemo(() => {
    return activeBills.filter(
      (b) => Number(b.dueDay) < currentDayOfMonth && !b.paidMonths?.[curMonthKey]
    );
  }, [activeBills, currentDayOfMonth, curMonthKey]);

  // Spent This Period (Outflows within active pay period)
  const spentThisPeriodStats = useMemo(() => {
    const periodExpenses = data.transactions.filter(
      (tx) =>
        Number(tx.amount) < 0 &&
        tx.date >= currentPayPeriod.startDate &&
        tx.date <= currentPayPeriod.endDate
    );
    const total = periodExpenses.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
    return { total, count: periodExpenses.length };
  }, [data.transactions, currentPayPeriod]);

  // Goals on the plan
  const onPlanGoals = data.goals.filter((g) => !g.archived && g.status === "on_plan");
  const goalAllocations = useMemo(() => {
    return onPlanGoals.reduce((sum, g) => sum + Number(g.amountPerPayPeriod || 0), 0);
  }, [onPlanGoals]);

  const freeToSpend = availableCash - billsThisPeriodTotal - goalAllocations;

  // BILL PAID TOGGLE (Auto-creates ledger transaction & directly deducts from account balance!)
  const handleToggleBillPaid = (billId: number | string) => {
    const curMonth = monthKey(todayStr);
    const bill = data.bills.find((b) => String(b.id) === String(billId));
    if (!bill) return;

    const isCurrentlyPaid = !!bill.paidMonths?.[curMonth];
    const txKeyId = `bill-pay-${bill.id}-${curMonth}`;
    const billAccountId = bill.accountId || data.accounts[0]?.id || 1;

    let nextTransactions = [...data.transactions];
    if (!isCurrentlyPaid) {
      const payTx: Transaction = {
        id: txKeyId,
        key: `${todayStr}|${(-Math.abs(bill.amount)).toFixed(2)}|${normalizeMerchant(bill.name)}|${billAccountId}`,
        date: todayStr,
        description: bill.name,
        amount: -Math.abs(Number(bill.amount)),
        accountId: billAccountId,
        category: bill.category || "Insurance",
        txType: "Bill Payment",
        source: "Bill System",
        billId: bill.id,
      };
      nextTransactions = [payTx, ...nextTransactions];
    } else {
      nextTransactions = nextTransactions.filter((t) => t.id !== txKeyId);
    }

    const updatedBills = data.bills.map((b) => {
      if (String(b.id) === String(billId)) {
        const paidMonths = { ...(b.paidMonths || {}) };
        paidMonths[curMonth] = !isCurrentlyPaid;
        return { ...b, paidMonths };
      }
      return b;
    });

    commit({
      ...data,
      bills: updatedBills,
      transactions: nextTransactions,
    });

    setNotification(
      !isCurrentlyPaid
        ? `Marked "${bill.name}" paid for ${curMonth} and deducted ${formatMoney(bill.amount)} from your account balance.`
        : `Marked "${bill.name}" unpaid for ${curMonth} and restored account balance.`
    );
  };

  // Transaction Save (with bulk rule updating across ledger)
  const handleSaveTransaction = (tx: Partial<Transaction>, alwaysCategorize: boolean) => {
    const isEdit = !!editingTx;
    const catName = tx.category?.trim() || "Other Spending";
    const desc = tx.description || "";
    const key = merchantRuleKey(desc);

    const nextRules = { ...data.merchantRules };
    if (alwaysCategorize && key) {
      nextRules[key] = catName;
    }

    let affectedCount = 0;
    let nextTxs = [...data.transactions];

    if (isEdit && editingTx) {
      nextTxs = nextTxs.map((t) => {
        if (
          alwaysCategorize &&
          catName &&
          (merchantRuleKey(t.description) === key ||
            normalizeMerchant(t.description) === normalizeMerchant(desc))
        ) {
          affectedCount++;
          return { ...t, category: catName };
        }
        if (t.id === editingTx.id) {
          return {
            ...t,
            ...tx,
            category: catName,
            key: `${tx.date}|${Number(tx.amount || 0).toFixed(2)}|${normalizeMerchant(desc)}|${tx.accountId}`,
          } as Transaction;
        }
        return t;
      });
    } else {
      const newTx: Transaction = {
        id: tx.id || `manual-${Date.now()}`,
        date: tx.date || todayStr,
        description: desc,
        amount: Number(tx.amount || 0),
        accountId: tx.accountId || data.accounts[0]?.id || 1,
        category: catName,
        txType: tx.txType || "Purchase",
        source: tx.source || "Manual",
        key: `${tx.date}|${Number(tx.amount || 0).toFixed(2)}|${normalizeMerchant(desc)}|${tx.accountId}`,
      };

      if (alwaysCategorize && key) {
        nextTxs = nextTxs.map((t) => {
          if (
            merchantRuleKey(t.description) === key ||
            normalizeMerchant(t.description) === normalizeMerchant(desc)
          ) {
            affectedCount++;
            return { ...t, category: catName };
          }
          return t;
        });
      }
      nextTxs = [newTx, ...nextTxs];
    }

    const nextCats = !data.customCategories.includes(catName)
      ? [...data.customCategories, catName]
      : data.customCategories;

    commit({
      ...data,
      transactions: nextTxs,
      merchantRules: nextRules,
      customCategories: nextCats,
    });

    setNotification(
      alwaysCategorize && affectedCount > 1
        ? `Saved transaction and updated ${affectedCount} matching records for "${desc}" to "${catName}"!`
        : "Transaction saved to ledger."
    );
    setEditingTx(null);
  };

  // CSV Import Launch
  const handleStartCsv = (account: Account) => {
    targetCsvAccountRef.current = account;
    fileInputRef.current?.click();
  };

  const handleCsvFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !targetCsvAccountRef.current) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || "";
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        setNotification("The selected CSV file is empty or does not contain valid data rows.");
        return;
      }
      const delimiter = detectDelimiter(lines.slice(0, 10));
      const headers = splitCsvLine(lines[0], delimiter);
      setCsvData({
        account: targetCsvAccountRef.current!,
        fileName: file.name,
        rawLines: lines.slice(1),
        delimiter,
        headers,
      });
    };
    reader.readAsText(file);
  };

  // Export Backups
  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-next-step-budget-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification("Backup file saved to your device.");
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
    setNotification("Transaction ledger exported as CSV.");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.accounts && parsed.transactions) {
          commit({ ...seedData, ...parsed });
          setNotification("Budget data successfully restored!");
        } else {
          setNotification("Invalid backup file format.");
        }
      } catch {
        setNotification("Failed to read backup file. Make sure it is a valid JSON backup.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportRawData = (rawText: string): boolean => {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.accounts)) {
        commit({
          ...seedData,
          ...parsed,
          accounts: parsed.accounts.length ? parsed.accounts : defaultStarterAccounts,
          settings: {
            ...seedData.settings,
            ...(parsed.settings || {}),
          },
        });
        setNotification("🎉 Budget data synced successfully!");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSlimLedger = (monthsOld: number = 6) => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsOld);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const oldTxs = data.transactions.filter((tx) => tx.date < cutoffStr);
    const keepTxs = data.transactions.filter((tx) => tx.date >= cutoffStr);

    if (oldTxs.length === 0) {
      setNotification(`No transactions older than ${monthsOld} months to slim.`);
      return;
    }

    // 1. Download archive backup file before deleting anything
    const archiveData = {
      archiveCutoffDate: cutoffStr,
      archivedAt: todayStr,
      archivedTransactionCount: oldTxs.length,
      transactions: oldTxs,
      accounts: data.accounts,
    };
    const jsonStr = JSON.stringify(archiveData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-archive-before-${cutoffStr}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // 2. Roll past transactions into each account's starting balance as of cutoffStr
    const updatedAccounts = data.accounts.map((acc) => {
      const start = Number(acc.statementBalance || 0);
      const oldSum = data.transactions
        .filter(
          (tx) =>
            String(tx.accountId) === String(acc.id) &&
            tx.date >= acc.balanceDate &&
            tx.date < cutoffStr
        )
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      return {
        ...acc,
        statementBalance: start + oldSum,
        balanceDate: cutoffStr,
      };
    });

    // 3. Commit slimmed data
    commit({
      ...data,
      accounts: updatedAccounts,
      transactions: keepTxs,
    });

    setNotification(
      `⚡ Ledger slimmed! Archived ${oldTxs.length} old entries to file. Account balances remain 100% exact.`
    );
  };

  return (
    <div className="min-h-screen bg-[#e8eef4] text-[#0f172a] font-sans pb-28 selection:bg-cyan-300">
      {/* Hidden file input for CSV Machine */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleCsvFilePicked}
      />

      {/* TOP HEADER */}
      <Header
        activeTab={activeTab}
        moreSubPage={moreSubPage}
        onOpenCalc={() => setIsCalcOpen(true)}
        onOpenInstallModal={handleOpenInstallApp}
        onOpenSyncModal={handleOpenSyncHub}
        isPro={paywallStatus.isPro}
        daysRemaining={paywallStatus.daysRemaining}
        isTrialActive={paywallStatus.isTrialActive}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="max-w-xl mx-auto px-4 mt-3">
          <button
            className="w-full rounded-2xl bg-lime-300 border border-lime-400 p-3 text-left font-bold text-slate-950 text-sm shadow-md flex items-center justify-between cursor-pointer"
            onClick={() => setNotification("")}
          >
            <span>{notification}</span>
            <span className="text-xs bg-lime-400 px-2 py-0.5 rounded-full font-black">✕</span>
          </button>
        </div>
      )}

      {/* MAIN VIEW TABS */}
      <main className="max-w-[1100px] mx-auto p-4 sm:p-6 space-y-4">
        {activeTab === "home" && (
          <HomeTab
            data={data}
            availableCash={availableCash}
            billsThisPeriodTotal={billsThisPeriodTotal}
            spentThisPeriodTotal={spentThisPeriodStats.total}
            spentThisPeriodCount={spentThisPeriodStats.count}
            missedBills={missedBills}
            goalAllocations={goalAllocations}
            freeToSpend={freeToSpend}
            payPeriod={currentPayPeriod}
            onOpenPayPeriodModal={() => setIsPayPeriodModalOpen(true)}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              setMoreSubPage(null);
            }}
            isPaywallActive={paywallStatus.isPaywallActive}
            isPro={paywallStatus.isPro}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsTab
            data={data}
            payPeriod={currentPayPeriod}
            onOpenAddModal={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
          />
        )}

        {activeTab === "calendar" && (
          <CalendarTab
            data={data}
            payPeriod={currentPayPeriod}
            onToggleBillPaid={handleToggleBillPaid}
            onOpenAddBill={() => {
              setEditingBill(null);
              setIsBillModalOpen(true);
            }}
            onEditBill={(bill) => {
              setEditingBill(bill);
              setIsBillModalOpen(true);
            }}
            onDeleteBill={(billId) => {
              commit({
                ...data,
                bills: data.bills.filter((b) => String(b.id) !== String(billId)),
              });
              setNotification("Bill removed from Calendar.");
            }}
          />
        )}

        {activeTab === "accounts" && (
          <AccountsTab
            data={data}
            onStartCsv={handleStartCsv}
            onSaveAccount={(acc) => {
              const exists = data.accounts.some((a) => String(a.id) === String(acc.id));
              commit({
                ...data,
                accounts: exists
                  ? data.accounts.map((a) => (String(a.id) === String(acc.id) ? acc : a))
                  : [...data.accounts, acc],
              });
              setNotification(`Account "${acc.name}" saved!`);
            }}
            onDeleteAccount={(acc) => {
              if (data.accounts.filter((a) => !a.archived).length <= 1) {
                setNotification("You must keep at least one active account.");
                return;
              }
              setAccountToDelete(acc);
            }}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            isPaywallActive={paywallStatus.isPaywallActive}
            isPro={paywallStatus.isPro}
          />
        )}

        {activeTab === "more" && (
          <MoreTab
            data={data}
            moreSubPage={moreSubPage}
            setMoreSubPage={setMoreSubPage}
            payPeriod={currentPayPeriod}
            onOpenAddBill={() => {
              setEditingBill(null);
              setIsBillModalOpen(true);
            }}
            onEditBill={(bill) => {
              setEditingBill(bill);
              setIsBillModalOpen(true);
            }}
            onOpenAddGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={(goalId) => {
              commit({
                ...data,
                goals: data.goals.filter((g) => String(g.id) !== String(goalId)),
              });
              setNotification("Goal deleted.");
            }}
            onToggleBillPaid={handleToggleBillPaid}
            onDeleteBill={(billId) => {
              commit({
                ...data,
                bills: data.bills.filter((b) => String(b.id) !== String(billId)),
              });
              setNotification("Bill deleted.");
            }}
            onUpdateSettings={(settings) => {
              commit({ ...data, settings });
              setNotification("Settings updated.");
            }}
            onDeleteVendorRule={(vendor) => {
              const rules = { ...data.merchantRules };
              delete rules[vendor];
              commit({ ...data, merchantRules: rules });
              setNotification(`Rule for "${vendor}" removed.`);
            }}
            freeToSpend={freeToSpend}
            availableCash={availableCash}
            billsThisPeriodTotal={billsThisPeriodTotal}
            allCategories={allCategories}
            onOpenPayPeriodModal={() => setIsPayPeriodModalOpen(true)}
            onOpenEraseConfirm={() => setIsEraseModalOpen(true)}
            onExportBackup={handleExportBackup}
            onExportCsv={handleExportCsv}
            onImportBackup={handleImportBackup}
            onOpenInstallModal={handleOpenInstallApp}
            onOpenSyncModal={handleOpenSyncHub}
            onOpenShareModal={handleOpenShareApp}
            onSlimLedger={handleSlimLedger}
            isPaywallActive={paywallStatus.isPaywallActive}
            isPro={paywallStatus.isPro}
            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
          />
        )}
      </main>

      {/* 5-BUTTON BOTTOM NAVIGATION */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMoreSubPage(null);
        }}
      />

      {/* QUICK CALCULATOR MODAL */}
      <CalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onCopyResult={(val) => setNotification(`Copied $${val} to clipboard!`)}
      />

      {/* PAY PERIOD CONFIG MODAL */}
      <PayPeriodConfigModal
        isOpen={isPayPeriodModalOpen}
        onClose={() => setIsPayPeriodModalOpen(false)}
        settings={data.settings.payPeriod}
        onSave={(updated) => {
          commit({
            ...data,
            settings: {
              ...data.settings,
              payPeriod: updated,
            },
          });
          setNotification(
            "Pay period updated! Dashboard and Calendar now reflect your new cycle."
          );
        }}
      />

      {/* RECEIPT VIEWFINDER & QUICK ENTRY MODAL */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        accounts={activeAccounts}
        categories={allCategories}
        merchantRules={data.merchantRules}
        onAddTransaction={(tx, alwaysCategorize) => {
          handleSaveTransaction(tx, alwaysCategorize);
        }}
      />

      {/* TRANSACTION ADD / EDIT MODAL */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        accounts={activeAccounts}
        categories={allCategories}
        merchantRules={data.merchantRules}
        initialData={editingTx}
        onSave={(tx, alwaysCategorize) => {
          handleSaveTransaction(tx, alwaysCategorize);
        }}
        onDelete={(id) => {
          commit({
            ...data,
            transactions: data.transactions.filter((t) => t.id !== id),
          });
          setNotification("Transaction deleted.");
        }}
      />

      {/* BILL ADD / EDIT MODAL */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setEditingBill(null);
        }}
        accounts={activeAccounts}
        initialData={editingBill}
        onSave={(bill) => {
          const exists = data.bills.some((b) => String(b.id) === String(bill.id));
          commit({
            ...data,
            bills: exists
              ? data.bills.map((b) => (String(b.id) === String(bill.id) ? (bill as Bill) : b))
              : [...data.bills, bill as Bill],
          });
          setNotification(`Bill "${bill.name}" saved!`);
          setEditingBill(null);
        }}
      />

      {/* GOAL ADD / EDIT MODAL */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        depositTransactions={data.transactions.filter((t) => t.amount > 0)}
        initialData={editingGoal}
        onSave={(goal) => {
          const exists = data.goals.some((g) => String(g.id) === String(goal.id));
          commit({
            ...data,
            goals: exists
              ? data.goals.map((g) => (String(g.id) === String(goal.id) ? (goal as Goal) : g))
              : [...data.goals, goal as Goal],
          });
          setNotification(`Goal "${goal.name}" saved!`);
          setEditingGoal(null);
        }}
      />

      {/* CSV MACHINE WIZARD MODAL */}
      {csvData && (
        <CsvMachineModal
          isOpen={!!csvData}
          onClose={() => setCsvData(null)}
          rawLines={csvData.rawLines}
          delimiter={csvData.delimiter}
          headers={csvData.headers}
          account={csvData.account}
          fileName={csvData.fileName}
          existingTransactions={data.transactions}
          merchantRules={data.merchantRules}
          onImportSuccess={(newTxs, newBills, msg) => {
            commit({
              ...data,
              transactions: [...newTxs, ...data.transactions],
              bills: [...data.bills, ...newBills],
            });
            setNotification(msg);
          }}
        />
      )}

      {/* DELETE ALL CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={isEraseModalOpen}
        onClose={() => setIsEraseModalOpen(false)}
        title="Erase Budget Data?"
        message="This will erase all transactions, bills, goals, and custom vendor rules back to a fresh Checking and Savings template. Your Pro / VIP membership status will NOT be affected."
        onConfirm={() => {
          const vault = loadLicenseVault();
          const preservedSettings = {
            ...seedData.settings,
            isPro: !!(vault.isPro || data.settings.isPro),
            proSource: data.settings.proSource || vault.proSource,
            installDate: vault.installDate || data.settings.installDate || getTodayStr(),
          };
          commit({
            ...seedData,
            settings: preservedSettings,
          });
          setNotification(
            "Budget reset to a fresh Checking & Savings template. Your Pro / VIP status was kept intact!"
          );
        }}
      />

      {/* DELETE SINGLE ACCOUNT CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        title="Delete Account?"
        message={`Are you sure you want to delete "${accountToDelete?.name}"? Any recorded transactions tied to it will remain in your ledger.`}
        onConfirm={() => {
          if (!accountToDelete) return;
          const remaining = data.accounts.filter(
            (a) => String(a.id) !== String(accountToDelete.id)
          );
          commit({ ...data, accounts: remaining });
          setAccountToDelete(null);
          setNotification(`Account "${accountToDelete.name}" was deleted.`);
        }}
      />

      {/* INSTALL, SYNC & SHARE HUB MODAL */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        initialTab={installModalTab}
        data={data}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onImportRawData={handleImportRawData}
        onNotify={(msg) => setNotification(msg)}
      />

      {/* PRO UPGRADE & VIP PASSCODE MODAL */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        settings={data.settings}
        onUpdateSettings={(updatedSettings) => {
          commit({
            ...data,
            settings: updatedSettings,
          });
        }}
        onNotify={(msg) => setNotification(msg)}
      />
    </div>
  );
}
