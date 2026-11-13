import React, { useMemo } from "react";
import { AppData, AppSettings, Bill, Goal, MoreSubPage, PayPeriodInfo } from "../types";
import { getTodayStr, monthKey } from "../utils/payPeriod";
import { BillsSubPage } from "./more/BillsSubPage";
import { GoalsSubPage } from "./more/GoalsSubPage";
import { RealityCheckSubPage } from "./more/RealityCheckSubPage";
import { SettingsSubPage } from "./more/SettingsSubPage";
import { MoreCommandCenterMenu } from "./more/MoreCommandCenterMenu";

interface MoreTabProps {
  data: AppData;
  moreSubPage: MoreSubPage;
  setMoreSubPage: (page: MoreSubPage) => void;
  payPeriod: PayPeriodInfo;
  freeToSpend: number;
  availableCash: number;
  billsThisPeriodTotal: number;
  allCategories: string[];
  onOpenAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onOpenAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: number | string) => void;
  onToggleBillPaid: (billId: number | string) => void;
  onDeleteBill: (billId: number | string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onDeleteVendorRule: (vendorKey: string) => void;
  onOpenPayPeriodModal: () => void;
  onOpenEraseConfirm: () => void;
  onExportBackup: () => void;
  onExportCsv: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenInstallModal?: () => void;
  onOpenSyncModal?: () => void;
  onOpenShareModal?: () => void;
  onSlimLedger?: (monthsOld: number) => void;
  isPaywallActive?: boolean;
  isPro?: boolean;
  onUpgradeClick?: () => void;
}

export const MoreTab: React.FC<MoreTabProps> = (props) => {
  const { data, moreSubPage, setMoreSubPage, payPeriod, freeToSpend, billsThisPeriodTotal, allCategories, isPaywallActive = false, isPro = false } = props;
  const curMonthKey = monthKey(getTodayStr());

  const dataSizeKb = useMemo(() => {
    try { return Math.max(1, Math.round(JSON.stringify(data).length / 1024)); } catch { return 1; }
  }, [data]);

  const activeBills = useMemo(() => data.bills.filter((b) => !b.archived), [data.bills]);
  const activeGoals = useMemo(() => data.goals.filter((g) => !g.archived), [data.goals]);
  const trackedHabitCategory = data.settings.trackedHabitCategory || (allCategories.includes("Entertainment") ? "Entertainment" : allCategories[0] || "Other Spending");

  const habitPayPeriodTotal = useMemo(
    () => data.transactions.filter((t) => Number(t.amount) < 0 && (t.category || "Other Spending") === trackedHabitCategory && t.date >= payPeriod.startDate && t.date <= payPeriod.endDate).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
    [data.transactions, trackedHabitCategory, payPeriod.startDate, payPeriod.endDate]
  );

  const habitMonthTotal = useMemo(
    () => data.transactions.filter((t) => Number(t.amount) < 0 && (t.category || "Other Spending") === trackedHabitCategory && t.date.startsWith(curMonthKey)).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
    [data.transactions, trackedHabitCategory, curMonthKey]
  );

  return (
    <div className="flex-1 flex flex-col gap-4 w-full">
      {moreSubPage === "bills" && (
        <BillsSubPage bills={activeBills} accounts={data.accounts} curMonthKey={curMonthKey} onBack={() => setMoreSubPage(null)} onOpenAddBill={props.onOpenAddBill} onEditBill={props.onEditBill} onToggleBillPaid={props.onToggleBillPaid} onDeleteBill={props.onDeleteBill} />
      )}
      {moreSubPage === "goals" && (
        <GoalsSubPage goals={activeGoals} onBack={() => setMoreSubPage(null)} onOpenAddGoal={props.onOpenAddGoal} onEditGoal={props.onEditGoal} onDeleteGoal={props.onDeleteGoal} />
      )}
      {moreSubPage === "insights" && (
        <RealityCheckSubPage settings={data.settings} transactions={data.transactions} payPeriod={payPeriod} freeToSpend={freeToSpend} billsThisPeriodTotal={billsThisPeriodTotal} allCategories={allCategories} trackedHabitCategory={trackedHabitCategory} habitPayPeriodTotal={habitPayPeriodTotal} habitMonthTotal={habitMonthTotal} onBack={() => setMoreSubPage(null)} onNavigateSubPage={setMoreSubPage} onUpdateSettings={props.onUpdateSettings} />
      )}
      {moreSubPage === "settings" && (
        <SettingsSubPage data={data} payPeriod={payPeriod} allCategories={allCategories} trackedHabitCategory={trackedHabitCategory} dataSizeKb={dataSizeKb} isPro={isPro} isPaywallActive={isPaywallActive} onBack={() => setMoreSubPage(null)} onOpenPayPeriodModal={props.onOpenPayPeriodModal} onUpdateSettings={props.onUpdateSettings} onDeleteVendorRule={props.onDeleteVendorRule} onUpgradeClick={props.onUpgradeClick} onExportBackup={props.onExportBackup} onExportCsv={props.onExportCsv} onImportBackup={props.onImportBackup} onSlimLedger={props.onSlimLedger} onOpenEraseConfirm={props.onOpenEraseConfirm} />
      )}
      {!moreSubPage && (
        <MoreCommandCenterMenu isPaywallActive={isPaywallActive} isPro={isPro} onSelectSubPage={setMoreSubPage} onOpenSyncModal={props.onOpenSyncModal} onOpenInstallModal={props.onOpenInstallModal} onOpenShareModal={props.onOpenShareModal} onUpgradeClick={props.onUpgradeClick} />
      )}
    </div>
  );
};
