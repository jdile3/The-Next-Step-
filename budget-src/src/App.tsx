import React, { useState, useRef, useEffect, useCallback } from "react";
import { Account, Bill, Goal, MoreSubPage, NavigationTab, Transaction } from "./types";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { HomeTab } from "./components/HomeTab";
import { TransactionsTab } from "./components/TransactionsTab";
import { CalendarTab } from "./components/CalendarTab";
import { AccountsTab } from "./components/AccountsTab";
import { MoreTab } from "./components/MoreTab";
import { AppModalsHost, CsvImportPayload } from "./components/AppModalsHost";
import { VIDEO_AD_CONFIG } from "./utils/monetization";
import { detectDelimiter, splitCsvLine } from "./utils/money";
import { useBudgetStorage } from "./hooks/useBudgetStorage";
import { useBudgetMetrics } from "./hooks/useBudgetMetrics";
import { useBudgetActions } from "./hooks/useBudgetActions";
import { useDataVaultExport } from "./hooks/useDataVaultExport";

export default function App() {
  const [notification, setNotification] = useState("");
  const notify = useCallback((msg: string) => setNotification(msg), []);
  const { data, commit } = useBudgetStorage(notify);
  const metrics = useBudgetMetrics(data);

  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [moreSubPage, setMoreSubPage] = useState<MoreSubPage>(null);
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
  const [installModalTab, setInstallModalTab] = useState<"cloud" | "android" | "windows" | "share">("cloud");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isVideoAdOpen, setIsVideoAdOpen] = useState(false);
  const [csvData, setCsvData] = useState<CsvImportPayload | null>(null);

  const lastVideoAdShownAtRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetCsvAccountRef = useRef<Account | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const actions = useBudgetActions({ data, editingTx, setEditingTx, commit, onNotify: notify });
  const vault = useDataVaultExport({ data, commit, onNotify: notify });

  const handleCsvFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !targetCsvAccountRef.current) return;
    const reader = new FileReader();
    reader.onerror = () => {
      notify("Could not read the selected CSV file.");
    };
    reader.onload = (evt) => {
      const lines = ((evt.target?.result as string) || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { notify("The selected CSV file is empty or does not contain valid data rows."); return; }
      const delimiter = detectDelimiter(lines.slice(0, 10));
      setCsvData({ account: targetCsvAccountRef.current!, fileName: file.name, rawLines: lines.slice(1), delimiter, headers: splitCsvLine(lines[0], delimiter) });
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-transparent text-white font-sans pb-[5.75rem] selection:bg-cyan-400 selection:text-slate-950">
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvFilePicked} />

      <Header
        activeTab={activeTab}
        moreSubPage={moreSubPage}
        onOpenCalc={() => setIsCalcOpen(true)}
        onOpenInstallModal={() => { setInstallModalTab("android"); setIsInstallModalOpen(true); }}
        onOpenSyncModal={() => { setInstallModalTab("cloud"); setIsInstallModalOpen(true); }}
        isPro={metrics.paywallStatus.isPro}
        daysRemaining={metrics.paywallStatus.daysRemaining}
        isTrialActive={metrics.paywallStatus.isTrialActive}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
      />

      {notification && (
        <div className="w-full max-w-[68rem] mx-auto px-3.5 mt-3 shrink-0">
          <button type="button" onClick={() => setNotification("")} className="flex items-center justify-between w-full p-3 px-5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-left text-xs font-black text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer">
            <span>{notification}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-xs font-black">✕</span>
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col w-full max-w-[68rem] mx-auto px-3.5 py-3">
        {activeTab === "home" && (
          <HomeTab data={data} availableCash={metrics.availableCash} billsThisPeriodTotal={metrics.billsThisPeriodTotal} spentThisPeriodTotal={metrics.spentThisPeriodStats.total} spentThisPeriodCount={metrics.spentThisPeriodStats.count} missedBills={metrics.missedBills} goalAllocations={metrics.goalAllocations} freeToSpend={metrics.freeToSpend} payPeriod={metrics.currentPayPeriod} onOpenPayPeriodModal={() => setIsPayPeriodModalOpen(true)} onNavigateToTab={(tab, sub) => { setActiveTab(tab); setMoreSubPage(sub || null); }} onOpenAddTransaction={() => { setEditingTx(null); setIsTxModalOpen(true); }} onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)} onOpenAddBill={() => { setEditingBill(null); setIsBillModalOpen(true); }} isPaywallActive={metrics.paywallStatus.isPaywallActive} isPro={metrics.paywallStatus.isPro} onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab data={data} payPeriod={metrics.currentPayPeriod} onOpenAddModal={() => { setEditingTx(null); setIsTxModalOpen(true); }} onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)} onEditTransaction={(tx) => { setEditingTx(tx); setIsTxModalOpen(true); }} />
        )}
        {activeTab === "calendar" && (
          <CalendarTab data={data} payPeriod={metrics.currentPayPeriod} onToggleBillPaid={actions.handleToggleBillPaid} onOpenAddBill={() => { setEditingBill(null); setIsBillModalOpen(true); }} onEditBill={(bill) => { setEditingBill(bill); setIsBillModalOpen(true); }} onDeleteBill={(billId) => { commit({ ...data, bills: data.bills.filter((b) => String(b.id) !== String(billId)) }); notify("Bill removed from Calendar."); }} />
        )}
        {activeTab === "accounts" && (
          <AccountsTab data={data} onStartCsv={(acc) => { targetCsvAccountRef.current = acc; fileInputRef.current?.click(); }} onSaveAccount={(acc) => { const exists = data.accounts.some((a) => String(a.id) === String(acc.id)); commit({ ...data, accounts: exists ? data.accounts.map((a) => (String(a.id) === String(acc.id) ? acc : a)) : [...data.accounts, acc] }); notify(`Account "${acc.name}" saved!`); }} onDeleteAccount={(acc) => { if (metrics.activeAccounts.length <= 1) { notify("You must keep at least one active account."); return; } setAccountToDelete(acc); }} onUpgradeClick={() => setIsUpgradeModalOpen(true)} isPaywallActive={metrics.paywallStatus.isPaywallActive} isPro={metrics.paywallStatus.isPro} />
        )}
        {activeTab === "more" && (
          <MoreTab data={data} moreSubPage={moreSubPage} setMoreSubPage={setMoreSubPage} payPeriod={metrics.currentPayPeriod} freeToSpend={metrics.freeToSpend} availableCash={metrics.availableCash} billsThisPeriodTotal={metrics.billsThisPeriodTotal} allCategories={metrics.allCategories} onOpenAddBill={() => { setEditingBill(null); setIsBillModalOpen(true); }} onEditBill={(b) => { setEditingBill(b); setIsBillModalOpen(true); }} onOpenAddGoal={() => { setEditingGoal(null); setIsGoalModalOpen(true); }} onEditGoal={(g) => { setEditingGoal(g); setIsGoalModalOpen(true); }} onDeleteGoal={(id) => { commit({ ...data, goals: data.goals.filter((g) => String(g.id) !== String(id)) }); notify("Goal deleted."); }} onToggleBillPaid={actions.handleToggleBillPaid} onDeleteBill={(id) => { commit({ ...data, bills: data.bills.filter((b) => String(b.id) !== String(id)) }); notify("Bill deleted."); }} onUpdateSettings={(s) => { commit({ ...data, settings: s }); notify("Settings updated."); }} onDeleteVendorRule={(v) => { const r = { ...data.merchantRules }; delete r[v]; commit({ ...data, merchantRules: r }); notify(`Rule for "${v}" removed.`); }} onOpenPayPeriodModal={() => setIsPayPeriodModalOpen(true)} onOpenEraseConfirm={() => setIsEraseModalOpen(true)} onExportBackup={vault.handleExportBackup} onExportCsv={vault.handleExportCsv} onImportBackup={vault.handleImportBackup} onOpenInstallModal={() => { setInstallModalTab("android"); setIsInstallModalOpen(true); }} onOpenSyncModal={() => { setInstallModalTab("cloud"); setIsInstallModalOpen(true); }} onOpenShareModal={() => { setInstallModalTab("share"); setIsInstallModalOpen(true); }} onSlimLedger={vault.handleSlimLedger} isPaywallActive={metrics.paywallStatus.isPaywallActive} isPro={metrics.paywallStatus.isPro} onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
        )}
      </main>

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMoreSubPage(null);
          if (metrics.paywallStatus.isPaywallActive && !metrics.paywallStatus.isPro && VIDEO_AD_CONFIG.enabled && tab !== activeTab) {
            const now = Date.now();
            if (now - lastVideoAdShownAtRef.current >= (VIDEO_AD_CONFIG.cooldownMinutes || 3) * 60 * 1000) {
              lastVideoAdShownAtRef.current = now;
              setIsVideoAdOpen(true);
            }
          }
        }}
      />

      <AppModalsHost
        data={data} activeAccounts={metrics.activeAccounts} allCategories={metrics.allCategories} isPro={metrics.paywallStatus.isPro} isPaywallActive={metrics.paywallStatus.isPaywallActive}
        isCalcOpen={isCalcOpen} setIsCalcOpen={setIsCalcOpen} isPayPeriodModalOpen={isPayPeriodModalOpen} setIsPayPeriodModalOpen={setIsPayPeriodModalOpen}
        isReceiptScannerOpen={isReceiptScannerOpen} setIsReceiptScannerOpen={setIsReceiptScannerOpen} isTxModalOpen={isTxModalOpen} setIsTxModalOpen={setIsTxModalOpen}
        editingTx={editingTx} setEditingTx={setEditingTx} isBillModalOpen={isBillModalOpen} setIsBillModalOpen={setIsBillModalOpen} editingBill={editingBill} setEditingBill={setEditingBill}
        isGoalModalOpen={isGoalModalOpen} setIsGoalModalOpen={setIsGoalModalOpen} editingGoal={editingGoal} setEditingGoal={setEditingGoal} isEraseModalOpen={isEraseModalOpen} setIsEraseModalOpen={setIsEraseModalOpen}
        accountToDelete={accountToDelete} setAccountToDelete={setAccountToDelete} isInstallModalOpen={isInstallModalOpen} setIsInstallModalOpen={setIsInstallModalOpen} installModalTab={installModalTab}
        isUpgradeModalOpen={isUpgradeModalOpen} setIsUpgradeModalOpen={setIsUpgradeModalOpen} isVideoAdOpen={isVideoAdOpen} setIsVideoAdOpen={setIsVideoAdOpen} csvData={csvData} setCsvData={setCsvData}
        commit={commit} onNotify={notify} onSaveTransaction={actions.handleSaveTransaction} onEraseAll={actions.handleEraseAll} onExportBackup={vault.handleExportBackup} onImportBackup={vault.handleImportBackup} onImportRawData={vault.handleImportRawData}
      />
    </div>
  );
}
