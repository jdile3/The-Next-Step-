import { Bill, PayPeriodInfo, PayPeriodSettings } from "../types";

export const getTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0); // Noon to prevent timezone drift
};

export const formatIsoDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (dateStr: string, days: number): string => {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatIsoDate(d);
};

export const diffInDays = (dateA: string, dateB: string): number => {
  const msA = parseLocalDate(dateA).getTime();
  const msB = parseLocalDate(dateB).getTime();
  return Math.round((msA - msB) / (1000 * 60 * 60 * 24));
};

export const formatShortMonthDay = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Computes the exact active pay period based on user settings and current device date.
 * Auto-advances automatically as days pass with zero external APIs required.
 */
export const calculateCurrentPayPeriod = (
  settings: PayPeriodSettings,
  currentDateStr: string = getTodayStr()
): PayPeriodInfo => {
  const frequency = settings.frequency || "biweekly";
  const anchor = settings.anchorDate || "2026-11-01";

  if (frequency === "weekly") {
    const dayDiff = diffInDays(currentDateStr, anchor);
    const cycleCount = Math.floor(dayDiff / 7);
    const startDate = addDays(anchor, cycleCount * 7);
    const endDate = addDays(startDate, 6);
    const nextPayday = addDays(startDate, 7);
    const daysLeft = Math.max(0, diffInDays(endDate, currentDateStr) + 1);

    return {
      startDate,
      endDate,
      nextPayday,
      daysLeft,
      totalDays: 7,
      label: `${formatShortMonthDay(startDate)} – ${formatShortMonthDay(endDate)}`,
      formattedRange: `${formatShortMonthDay(startDate)} – ${formatShortMonthDay(endDate)} (Weekly)`
    };
  }

  if (frequency === "biweekly") {
    const dayDiff = diffInDays(currentDateStr, anchor);
    const cycleCount = Math.floor(dayDiff / 14);
    const startDate = addDays(anchor, cycleCount * 14);
    const endDate = addDays(startDate, 13);
    const nextPayday = addDays(startDate, 14);
    const daysLeft = Math.max(0, diffInDays(endDate, currentDateStr) + 1);

    return {
      startDate,
      endDate,
      nextPayday,
      daysLeft,
      totalDays: 14,
      label: `${formatShortMonthDay(startDate)} – ${formatShortMonthDay(endDate)}`,
      formattedRange: `${formatShortMonthDay(startDate)} – ${formatShortMonthDay(endDate)} (Bi-Weekly)`
    };
  }

  // Monthly frequency: anchor day of month
  const anchorD = parseLocalDate(anchor);
  const anchorDay = Math.min(28, Math.max(1, anchorD.getDate()));
  const curD = parseLocalDate(currentDateStr);
  const curYear = curD.getFullYear();
  const curMonth = curD.getMonth();
  const curDay = curD.getDate();

  let startYear = curYear;
  let startMonth = curMonth;

  if (curDay < anchorDay) {
    // Current period started previous month
    startMonth = curMonth - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = curYear - 1;
    }
  }

  const startDateObj = new Date(startYear, startMonth, anchorDay, 12, 0, 0);
  const nextMonthObj = new Date(startYear, startMonth + 1, anchorDay, 12, 0, 0);
  const endDateObj = new Date(startYear, startMonth + 1, anchorDay - 1, 12, 0, 0);

  const startDate = formatIsoDate(startDateObj);
  const endDate = formatIsoDate(endDateObj);
  const nextPayday = formatIsoDate(nextMonthObj);
  const totalDays = diffInDays(endDate, startDate) + 1;
  const daysLeft = Math.max(0, diffInDays(endDate, currentDateStr) + 1);

  return {
    startDate,
    endDate,
    nextPayday,
    daysLeft,
    totalDays,
    label: `${formatShortMonthDay(startDate)} – ${formatShortMonthDay(endDate)}`,
    formattedRange: `${formatShortMonthDay(startDate)} – ${formatShortMonthDay(endDate)} (Monthly)`
  };
};

/**
 * Returns bills that fall due between startDate and endDate (inclusive).
 */
export const getBillsDueInPeriod = (
  bills: Bill[],
  startDate: string,
  endDate: string
): { bill: Bill; specificDueDate: string }[] => {
  const activeBills = bills.filter((b) => !b.archived);
  const result: { bill: Bill; specificDueDate: string }[] = [];

  // Generate list of all dates in the pay period
  const datesInPeriod: string[] = [];
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  const cur = new Date(start);
  while (cur <= end) {
    datesInPeriod.push(formatIsoDate(cur));
    cur.setDate(cur.getDate() + 1);
  }

  for (const bill of activeBills) {
    const dueDay = Number(bill.dueDay) || 1;
    for (const dStr of datesInPeriod) {
      const dObj = parseLocalDate(dStr);
      if (dObj.getDate() === dueDay) {
        result.push({ bill, specificDueDate: dStr });
        break;
      }
    }
  }

  // Sort by specific due date
  result.sort((a, b) => a.specificDueDate.localeCompare(b.specificDueDate));
  return result;
};

export const monthKey = (dateStr: string): string => {
  return (dateStr || getTodayStr()).slice(0, 7);
};
