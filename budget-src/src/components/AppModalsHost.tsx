import React from "react";
import { Account, AppData, Bill, Goal, Transaction } from "../types";
import { CalculatorModal } from "./CalculatorModal";
import { PayPeriodConfigModal } from "./PayPeriodConfigModal";
import { ReceiptScannerModal } from "./ReceiptScannerModal";
import { CsvMachineModal } from "./CsvMachineModal";
import { TransactionModal } from "./TransactionModal";
import { BillModal } from "./BillModal";
import { GoalModal } from "./GoalModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { InstallAppModal } from "./InstallAppModal";
import { UpgradeModal } from "./UpgradeModal";
import { VideoAdModal } from "./VideoAdModal";

export interface CsvImportPayload {
  account: Account;
  fileName: string;
  rawLines: string[];
  delimiter: string;
  headers: string[];
}

interface AppModalsHostProps {
  data: AppData;
  activeAccounts: Account[];
  allCategories: string[];
  isPro: boolean;
  isPaywallActive: boolean;
  isCalcOpen: boolean;
  setIsCalcOpen: (v: boolean) => void;
  isPayPeriodModalOpen: boolean;
  setIsPayPeriodModalOpen: (v: boolean) => void;
  isReceiptScannerOpen: boolean;
  setIsReceiptScannerOpen: (v: boolean) => void;
  isTxModalOpen: boolean;
  setIsTxModalOpen: (v: boolean) => void;
  editingTx: Transaction | null;
  setEditingTx: (tx: Transaction | null) => void;
  isBillModalOpen: boolean;
  setIsBillModalOpen: (v: boolean) => void;
  editingBill: Bill | null;
  setEditingBill: (b: Bill | null) => void;
  isGoalModalOpen: boolean;
  setIsGoalModalOpen: (v: boolean) => void;
  editingGoal: Goal | null;
  setEditingGoal: (g: Goal | null) => void;
  isEraseModalOpen: boolean;
  setIsEraseModalOpen: (v: boolean) => void;
  accountToDelete: Account | null;
  setAccountToDelete: (a: Account | null) => void;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (v: boolean) => void;
  installModalTab: "cloud" | "android" | "windows" | "share";
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (v: boolean) => void;
  isVideoAdOpen: boolean;
  setIsVideoAdOpen: (v: boolean) => void;
  csvData: CsvImportPayload | null;
  setCsvData: (c: CsvImportPayload | null) => void;
  commit: (next: AppData) => void;
  onNotify: (msg: string) => void;
  onSaveTransaction: (tx: Partial<Transaction>, alwaysCategorize: boolean) => void;
  onEraseAll: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportRawData: (rawText: string) => boolean;
}

export const AppModalsHost: React.FC<AppModalsHostProps> = (props) => {
  const { data, commit, onNotify } = props;
  return (
    <>
      <CalculatorModal isOpen={props.isCalcOpen} onClose={() => props.setIsCalcOpen(false)} onCopyResult={(val) => onNotify(`Copied $${val} to clipboard!`)} />
      <PayPeriodConfigModal isOpen={props.isPayPeriodModalOpen} onClose={() => props.setIsPayPeriodModalOpen(false)} settings={data.settings.payPeriod} onSave={(updated) => { commit({ ...data, settings: { ...data.settings, payPeriod: updated } }); onNotify("Pay period updated! Dashboard and Calendar now reflect your new cycle."); }} />
      <ReceiptScannerModal isOpen={props.isReceiptScannerOpen} onClose={() => props.setIsReceiptScannerOpen(false)} accounts={props.activeAccounts} categories={props.allCategories} merchantRules={data.merchantRules} onAddTransaction={props.onSaveTransaction} />
      <TransactionModal isOpen={props.isTxModalOpen} onClose={() => { props.setIsTxModalOpen(false); props.setEditingTx(null); }} accounts={props.activeAccounts} categories={props.allCategories} merchantRules={data.merchantRules} initialData={props.editingTx} onSave={props.onSaveTransaction} onDelete={(id) => { commit({ ...data, transactions: data.transactions.filter((t) => t.id !== id) }); onNotify("Transaction deleted."); }} />
      <BillModal isOpen={props.isBillModalOpen} onClose={() => { props.setIsBillModalOpen(false); props.setEditingBill(null); }} accounts={props.activeAccounts} initialData={props.editingBill} onSave={(bill) => { const exists = data.bills.some((b) => String(b.id) === String(bill.id)); commit({ ...data, bills: exists ? data.bills.map((b) => (String(b.id) === String(bill.id) ? (bill as Bill) : b)) : [...data.bills, bill as Bill] }); onNotify(`Bill "${bill.name}" saved!`); props.setEditingBill(null); }} />
      <GoalModal isOpen={props.isGoalModalOpen} onClose={() => { props.setIsGoalModalOpen(false); props.setEditingGoal(null); }} depositTransactions={data.transactions.filter((t) => t.amount > 0)} initialData={props.editingGoal} onSave={(goal) => { const exists = data.goals.some((g) => String(g.id) === String(goal.id)); commit({ ...data, goals: exists ? data.goals.map((g) => (String(g.id) === String(goal.id) ? (goal as Goal) : g)) : [...data.goals, goal as Goal] }); onNotify(`Goal "${goal.name}" saved!`); props.setEditingGoal(null); }} />
      {props.csvData && (
        <CsvMachineModal isOpen={Boolean(props.csvData)} onClose={() => props.setCsvData(null)} rawLines={props.csvData.rawLines} delimiter={props.csvData.delimiter} headers={props.csvData.headers} account={props.csvData.account} fileName={props.csvData.fileName} existingTransactions={data.transactions} merchantRules={data.merchantRules} onImportSuccess={(newTxs, newBills, msg) => { commit({ ...data, transactions: [...newTxs, ...data.transactions], bills: [...data.bills, ...newBills] }); onNotify(msg); }} />
      )}
      <DeleteConfirmModal isOpen={props.isEraseModalOpen} onClose={() => props.setIsEraseModalOpen(false)} title="Erase Budget Data?" message="This will erase all transactions, bills, goals, and custom vendor rules back to a fresh Checking and Savings template. Your Pro / VIP membership status will NOT be affected." onConfirm={props.onEraseAll} />
      <DeleteConfirmModal
        isOpen={Boolean(props.accountToDelete)}
        onClose={() => props.setAccountToDelete(null)}
        title="Delete Account?"
        message={`Are you sure you want to delete "${props.accountToDelete?.name}"? Any recorded transactions tied to it will remain in your ledger.`}
        onConfirm={() => {
          if (!props.accountToDelete) return;
          commit({ ...data, accounts: data.accounts.filter((a) => String(a.id) !== String(props.accountToDelete!.id)) });
          onNotify(`Account "${props.accountToDelete.name}" was deleted.`);
          props.setAccountToDelete(null);
        }}
      />
      <InstallAppModal isOpen={props.isInstallModalOpen} onClose={() => props.setIsInstallModalOpen(false)} initialTab={props.installModalTab} data={data} onExportBackup={props.onExportBackup} onImportBackup={props.onImportBackup} onImportRawData={props.onImportRawData} onNotify={onNotify} />
      {!props.isPro && <UpgradeModal isOpen={props.isUpgradeModalOpen} onClose={() => props.setIsUpgradeModalOpen(false)} settings={data.settings} onUpdateSettings={(updated) => commit({ ...data, settings: updated })} onNotify={onNotify} />}
      {!props.isPro && props.isPaywallActive && <VideoAdModal isOpen={props.isVideoAdOpen} isPro={props.isPro} onClose={() => props.setIsVideoAdOpen(false)} onUpgradeClick={() => { props.setIsVideoAdOpen(false); props.setIsUpgradeModalOpen(true); }} />}
    </>
  );
};
