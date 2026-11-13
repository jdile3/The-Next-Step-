import { useMemo } from "react";
import { AppData } from "../types";
import { DEFAULT_CATEGORIES } from "../utils/money";
import {
  calculateCurrentPayPeriod,
  getBillsDueInPeriod,
  getTodayStr,
  monthKey,
} from "../utils/payPeriod";
import { getPaywallStatus } from "../utils/paywall";

const safeNum = (val: unknown): number => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

export function useBudgetMetrics(data: AppData) {
  const todayStr = getTodayStr();
  const curMonthKey = monthKey(todayStr);
  const currentDayOfMonth = parseInt(todayStr.split("-")[2], 10);

  const paywallStatus = useMemo(() => getPaywallStatus(data.settings), [data.settings]);

  const currentPayPeriod = useMemo(
    () => calculateCurrentPayPeriod(data.settings.payPeriod, todayStr),
    [data.settings.payPeriod, todayStr]
  );

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

  const activeAccounts = useMemo(
    () => data.accounts.filter((a) => !a.archived),
    [data.accounts]
  );

  const availableCash = useMemo(() => {
    return activeAccounts
      .filter((a) => ["Checking", "Savings", "Cash"].includes(a.type))
      .reduce((sum, a) => {
        const start = safeNum(a.statementBalance);
        const txSum = data.transactions
          .filter(
            (tx) =>
              String(tx.accountId) === String(a.id) &&
              tx.date >= a.balanceDate &&
              tx.date <= todayStr
          )
          .reduce((acc, tx) => acc + safeNum(tx.amount), 0);
        return sum + start + txSum;
      }, 0);
  }, [activeAccounts, data.transactions, todayStr]);

  const activeBills = useMemo(() => data.bills.filter((b) => !b.archived), [data.bills]);

  const periodBills = useMemo(
    () => getBillsDueInPeriod(activeBills, currentPayPeriod.startDate, currentPayPeriod.endDate),
    [activeBills, currentPayPeriod.startDate, currentPayPeriod.endDate]
  );

  const billsThisPeriodTotal = useMemo(() => {
    return periodBills
      .filter((item) => !item.bill.paidMonths?.[monthKey(item.specificDueDate)])
      .reduce((sum, item) => sum + safeNum(item.bill.amount), 0);
  }, [periodBills]);

  const missedBills = useMemo(() => {
    return activeBills.filter(
      (b) => safeNum(b.dueDay) < currentDayOfMonth && !b.paidMonths?.[curMonthKey]
    );
  }, [activeBills, currentDayOfMonth, curMonthKey]);

  const spentThisPeriodStats = useMemo(() => {
    const periodExpenses = data.transactions.filter(
      (tx) =>
        safeNum(tx.amount) < 0 &&
        tx.date >= currentPayPeriod.startDate &&
        tx.date <= currentPayPeriod.endDate
    );
    const total = periodExpenses.reduce((sum, tx) => sum + Math.abs(safeNum(tx.amount)), 0);
    return { total, count: periodExpenses.length };
  }, [data.transactions, currentPayPeriod.startDate, currentPayPeriod.endDate]);

  const goalAllocations = useMemo(() => {
    return data.goals
      .filter((g) => !g.archived && g.status === "on_plan")
      .reduce((sum, g) => sum + safeNum(g.amountPerPayPeriod), 0);
  }, [data.goals]);

  const freeToSpend = availableCash - billsThisPeriodTotal - goalAllocations;

  return {
    todayStr,
    paywallStatus,
    currentPayPeriod,
    allCategories,
    activeAccounts,
    availableCash,
    billsThisPeriodTotal,
    missedBills,
    spentThisPeriodStats,
    goalAllocations,
    freeToSpend,
  };
}
