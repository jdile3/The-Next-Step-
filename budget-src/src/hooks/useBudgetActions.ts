import { AppData, Transaction } from "../types";
import { formatMoney, merchantRuleKey, normalizeMerchant } from "../utils/money";
import { getTodayStr, monthKey } from "../utils/payPeriod";
import { loadLicenseVault } from "../utils/paywall";
import { seedData } from "./useBudgetStorage";

interface UseBudgetActionsParams {
  data: AppData;
  editingTx: Transaction | null;
  setEditingTx: (tx: Transaction | null) => void;
  commit: (next: AppData) => void;
  onNotify: (msg: string) => void;
}

export function useBudgetActions({ data, editingTx, setEditingTx, commit, onNotify }: UseBudgetActionsParams) {
  const todayStr = getTodayStr();

  const handleToggleBillPaid = (billId: number | string, targetDate?: string) => {
    const curMonth = monthKey(targetDate || todayStr);
    const bill = data.bills.find((b) => String(b.id) === String(billId));
    if (!bill) return;

    const isCurrentlyPaid = Boolean(bill.paidMonths?.[curMonth]);
    const txKeyId = `bill-pay-${bill.id}-${curMonth}`;
    const billAccountId = bill.accountId || data.accounts[0]?.id || 1;
    const rawAmt = Number(bill.amount);
    const billAmt = Number.isFinite(rawAmt) ? Math.abs(rawAmt) : 0;

    let nextTransactions = [...data.transactions];
    if (!isCurrentlyPaid) {
      const payTx: Transaction = {
        id: txKeyId,
        key: `${todayStr}|${(-billAmt).toFixed(2)}|${normalizeMerchant(bill.name)}|${billAccountId}`,
        date: todayStr,
        description: bill.name,
        amount: -billAmt,
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
        return { ...b, paidMonths: { ...(b.paidMonths || {}), [curMonth]: !isCurrentlyPaid } };
      }
      return b;
    });

    commit({ ...data, bills: updatedBills, transactions: nextTransactions });
    onNotify(
      !isCurrentlyPaid
        ? `Marked "${bill.name}" paid for ${curMonth} and deducted ${formatMoney(billAmt)} from your account balance.`
        : `Marked "${bill.name}" unpaid for ${curMonth} and restored account balance.`
    );
  };

  const handleSaveTransaction = (tx: Partial<Transaction>, alwaysCategorize: boolean) => {
    const catName = tx.category?.trim() || "Other Spending";
    const desc = tx.description || "";
    const key = merchantRuleKey(desc);
    const nextRules = { ...data.merchantRules };
    if (alwaysCategorize && key) nextRules[key] = catName;

    let affectedCount = 0;
    let nextTxs = [...data.transactions];
    const matchesVendor = (d: string) =>
      merchantRuleKey(d) === key || normalizeMerchant(d) === normalizeMerchant(desc);

    if (editingTx) {
      nextTxs = nextTxs.map((t) => {
        if (alwaysCategorize && catName && matchesVendor(t.description)) {
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
          if (matchesVendor(t.description)) {
            affectedCount++;
            return { ...t, category: catName };
          }
          return t;
        });
      }
      nextTxs = [newTx, ...nextTxs];
    }

    const nextCats = !data.customCategories.includes(catName) ? [...data.customCategories, catName] : data.customCategories;
    commit({ ...data, transactions: nextTxs, merchantRules: nextRules, customCategories: nextCats });
    onNotify(alwaysCategorize && affectedCount > 1 ? `Saved transaction and updated ${affectedCount} matching records for "${desc}" to "${catName}"!` : "Transaction saved to ledger.");
    setEditingTx(null);
  };

  const handleEraseAll = () => {
    const vault = loadLicenseVault();
    commit({
      ...seedData,
      settings: {
        ...seedData.settings,
        isPro: Boolean(vault.isPro || data.settings.isPro),
        proSource: data.settings.proSource || vault.proSource,
        installDate: vault.installDate || data.settings.installDate || todayStr,
        ownershipSig: data.settings.ownershipSig || vault.ownershipSig,
        unlockedAt: data.settings.unlockedAt || vault.unlockedAt,
      },
    });
    onNotify("Budget reset to a fresh Checking & Savings template. Your Pro / VIP status was kept intact!");
  };

  return { handleToggleBillPaid, handleSaveTransaction, handleEraseAll };
}
