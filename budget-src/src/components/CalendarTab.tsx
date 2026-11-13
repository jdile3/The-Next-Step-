import React, { useState } from "react";
import {
  Plus,
  Check,
  Trash2,
  CalendarDays,
  Pencil,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { AppData, Bill, PayPeriodInfo } from "../types";
import { formatMoney } from "../utils/money";
import { getBillsDueInPeriod, getTodayStr, monthKey } from "../utils/payPeriod";

interface CalendarTabProps {
  data: AppData;
  payPeriod: PayPeriodInfo;
  onToggleBillPaid: (billId: number | string, targetDate?: string) => void;
  onOpenAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onDeleteBill: (billId: number | string) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CalendarTab: React.FC<CalendarTabProps> = ({
  data,
  payPeriod,
  onToggleBillPaid,
  onOpenAddBill,
  onEditBill,
  onDeleteBill,
}) => {
  const todayStr = getTodayStr();
  const curMonthKey = monthKey(todayStr);
  const currentDayOfMonth = parseInt(todayStr.split("-")[2], 10);

  const [selectedMonth, setSelectedMonth] = useState(todayStr.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<number | null>(currentDayOfMonth);
  const [billLedgerFilter, setBillLedgerFilter] = useState<"pay_period" | "all_month">("pay_period");

  const [yearNum, monthNum] = selectedMonth.split("-").map(Number);
  const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay();
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

  const shiftMonth = (delta: number) => {
    const d = new Date(yearNum, monthNum - 1 + delta, 1);
    const nextYm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(nextYm);
    setSelectedDay(null);
  };

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  const activeBills = data.bills.filter((b) => !b.archived);

  // Missed / Past-Due bills this month
  const missedBills = activeBills.filter(
    (b) => Number(b.dueDay) < currentDayOfMonth && !b.paidMonths?.[curMonthKey]
  );

  // Bills due in CURRENT PAY PERIOD
  const periodBills = getBillsDueInPeriod(activeBills, payPeriod.startDate, payPeriod.endDate);

  // Month-wide bills sorted by dueDay
  const monthBills = [...activeBills].sort((a, b) => Number(a.dueDay) - Number(b.dueDay));

  const billsToDisplay =
    billLedgerFilter === "pay_period"
      ? periodBills
      : monthBills.map((b) => ({
          bill: b,
          specificDueDate: `${selectedMonth}-${String(b.dueDay).padStart(2, "0")}`,
        }));

  const periodBillsTotal = periodBills.reduce((sum, item) => sum + Number(item.bill.amount), 0);
  const periodBillsUnpaid = periodBills
    .filter((item) => !item.bill.paidMonths?.[monthKey(item.specificDueDate)])
    .reduce((sum, item) => sum + Number(item.bill.amount), 0);

  const selectedDayBills =
    selectedDay !== null ? activeBills.filter((b) => Number(b.dueDay) === selectedDay) : [];

  return (
    <div className="flex-1 flex flex-col gap-4 w-full animate-tab-enter">
      {/* MISSED / PAST-DUE BILLS ALERT */}
      {missedBills.length > 0 && (
        <div className="bg-gradient-to-br from-rose-950/90 via-[#1a0a14] to-rose-950/80 border border-rose-500/50 rounded-[2rem] p-4 shadow-[0_12px_30px_rgba(244,63,94,0.2)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-200 uppercase tracking-wider">
                {missedBills.length} Past-Due {missedBills.length === 1 ? "Bill" : "Bills"} This Month
              </h3>
              <p className="text-xs text-rose-300/80">
                Check off any bill you already paid so your balance stays exact:
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {missedBills.map((bill) => {
              const acc = data.accounts.find((a) => String(a.id) === String(bill.accountId));
              return (
                <div
                  key={`missed-${bill.id}`}
                  className="bg-black/40 border border-rose-500/30 rounded-full px-4 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <b className="text-sm font-black text-white block truncate">{bill.name}</b>
                    <span className="text-xs text-rose-300 font-semibold block truncate">
                      Day {bill.dueDay} · {acc?.name || "Checking"} · {formatMoney(bill.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onToggleBillPaid(bill.id)}
                      className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-full flex items-center gap-1 cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Paid</span>
                    </button>
                    <button
                      onClick={() => onEditBill(bill)}
                      className="bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs px-3 py-2 rounded-full cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. SCULPTED CIRCULAR ORB CALENDAR (Zero Square Boxes!) */}
      <div className="relative bg-gradient-to-b from-[#0b192e]/95 via-[#071222]/95 to-[#050c18]/95 border border-cyan-400/25 rounded-[2.25rem] p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.65)] space-y-4 overflow-hidden">
        <div className="absolute -top-16 right-6 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Month Orbit Header */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div>
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-400 block">
              PAY PERIOD ORBIT
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              {MONTH_NAMES[(monthNum || 1) - 1]} {yearNum}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => shiftMonth(-1)}
              className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-200 cursor-pointer transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedMonth(todayStr.slice(0, 7));
                setSelectedDay(currentDayOfMonth);
              }}
              className="px-3 h-9 rounded-full bg-cyan-400/15 hover:bg-cyan-400/25 border border-cyan-400/30 text-xs font-extrabold text-cyan-300 cursor-pointer transition"
            >
              Today
            </button>
            <button
              onClick={() => shiftMonth(1)}
              className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-200 cursor-pointer transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend Pills */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 text-[0.68rem] font-bold text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <i className="w-2.5 h-2.5 rounded-full bg-cyan-400/40 ring-1 ring-cyan-400 inline-block" />
            Active Pay Period ({payPeriod.label})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Bill Due
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Paid
          </span>
        </div>

        {/* Days of Week Header */}
        <div className="relative z-10 grid grid-cols-7 text-center text-[0.68rem] font-black text-slate-500 uppercase tracking-widest pt-1">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Circular Day Orbs Matrix */}
        <div className="relative z-10 grid grid-cols-7 gap-y-2 gap-x-1 items-center justify-items-center">
          {daysGrid.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="w-10 h-10" />;
            }

            const dayDateStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
            const isToday = dayDateStr === todayStr;
            const isSelected = selectedDay === day;
            const isInPayPeriod =
              dayDateStr >= payPeriod.startDate && dayDateStr <= payPeriod.endDate;
            const billsOnDay = activeBills.filter((b) => Number(b.dueDay) === day);
            const hasUnpaidOnDay = billsOnDay.some((b) => !b.paidMonths?.[selectedMonth]);
            const allPaidOnDay = billsOnDay.length > 0 && !hasUnpaidOnDay;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`relative w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-gradient-to-tr from-cyan-400 to-emerald-300 text-slate-950 font-black scale-110 shadow-[0_0_20px_rgba(34,211,238,0.6)] z-10"
                    : isToday
                    ? "bg-cyan-500/25 text-cyan-200 ring-2 ring-cyan-400 font-black"
                    : hasUnpaidOnDay
                    ? "bg-amber-500/20 text-amber-200 border border-amber-400/50 font-black shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                    : allPaidOnDay
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 font-black"
                    : isInPayPeriod
                    ? "bg-cyan-500/10 text-slate-100 border border-cyan-400/20 font-bold"
                    : "text-slate-400 hover:bg-white/8 font-semibold"
                }`}
              >
                <span className="text-xs leading-none">{day}</span>
                {billsOnDay.length > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isSelected
                        ? "bg-slate-950"
                        : hasUnpaidOnDay
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Interactive Inspector Pill */}
        {selectedDay !== null && (
          <div className="relative z-10 mt-2 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-black text-cyan-300">
                Day {selectedDay}
              </span>
              {selectedDayBills.length > 0 ? (
                <span className="text-xs font-bold text-slate-200">
                  {selectedDayBills.map((b) => `${b.name} (${formatMoney(b.amount)})`).join(" · ")}
                </span>
              ) : (
                <span className="text-xs text-slate-400">No recurring bills scheduled on the {selectedDay}th</span>
              )}
            </div>

            <button
              onClick={onOpenAddBill}
              className="text-xs font-black text-cyan-300 hover:text-cyan-200 bg-cyan-400/15 border border-cyan-400/30 px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. VERTICAL BILL TIMELINE STREAM */}
      <div className="rounded-[2.25rem] bg-[#081426]/90 backdrop-blur-xl border border-white/10 p-5 text-white shadow-xl space-y-4 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Protected Bill Timeline</span>
            </h3>
            <span className="text-xs text-slate-400">
              Tap the circle next to any bill to mark it paid and auto-update your cash
            </span>
          </div>

          <button
            onClick={onOpenAddBill}
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Bill</span>
          </button>
        </div>

        {/* Segmented Pill Switch: Current Pay Period vs All Month */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-1 bg-slate-950/90 border border-white/10 p-1 rounded-full">
            <button
              onClick={() => setBillLedgerFilter("pay_period")}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black transition cursor-pointer ${
                billLedgerFilter === "pay_period"
                  ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pay Period ({periodBills.length})
            </button>
            <button
              onClick={() => setBillLedgerFilter("all_month")}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black transition cursor-pointer ${
                billLedgerFilter === "all_month"
                  ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Full Month ({monthBills.length})
            </button>
          </div>

          {billLedgerFilter === "pay_period" && (
            <div className="text-right text-xs">
              <span className="text-slate-400 font-semibold">Unpaid Lock: </span>
              <b className="text-amber-300 font-black text-sm tabular-nums">
                {formatMoney(periodBillsUnpaid)}
              </b>
              <span className="text-slate-500 tabular-nums"> / {formatMoney(periodBillsTotal)}</span>
            </div>
          )}
        </div>

        {/* Connected Vertical Spine Timeline */}
        <div className="relative pl-4 border-l-2 border-cyan-500/25 space-y-2.5">
          {billsToDisplay.map(({ bill, specificDueDate }) => {
            const billDueMonthKey = monthKey(specificDueDate);
            const isPaid = !!bill.paidMonths?.[billDueMonthKey];
            const isPastDue = !isPaid && specificDueDate < todayStr;
            const account = data.accounts.find((a) => String(a.id) === String(bill.accountId));

            return (
              <div
                key={bill.id}
                className={`relative rounded-3xl border px-4 py-3.5 transition flex items-center justify-between gap-2 ${
                  isPaid
                    ? "bg-emerald-950/30 border-emerald-500/35"
                    : isPastDue
                    ? "bg-rose-950/40 border-rose-500/45"
                    : "bg-white/5 border-white/10 hover:bg-white/8"
                }`}
              >
                {/* Spine Connector Dot */}
                <span
                  className={`absolute -left-[1.35rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#081426] ${
                    isPaid ? "bg-emerald-400" : isPastDue ? "bg-rose-500" : "bg-cyan-400"
                  }`}
                />

                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleBillPaid(bill.id, specificDueDate)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isPaid
                        ? "bg-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        : "bg-slate-900 border-2 border-slate-600 hover:border-cyan-400 text-transparent"
                    }`}
                    title={isPaid ? "Mark as unpaid" : "Mark paid for this month"}
                  >
                    <Check className={`w-4 h-4 stroke-[2.8] ${isPaid ? "text-slate-950" : "opacity-0"}`} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <b
                        className={`text-sm font-black truncate ${
                          isPaid ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {bill.name}
                      </b>
                      {isPaid && (
                        <span className="text-[0.65rem] text-emerald-300 font-extrabold uppercase tracking-wider">
                          Paid ✓
                        </span>
                      )}
                      {isPastDue && (
                        <span className="text-[0.65rem] text-rose-300 font-black uppercase tracking-wider">
                          Past Due
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span>Day {bill.dueDay}</span>
                      <span>·</span>
                      <span className="text-slate-300 font-semibold">{account?.name || "Checking"}</span>
                      <span>·</span>
                      <span>{bill.category || "Bill"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <b
                    className={`text-sm font-black tabular-nums mr-1 ${
                      isPaid ? "text-emerald-300/70" : "text-white"
                    }`}
                  >
                    {formatMoney(bill.amount)}
                  </b>
                  <button
                    onClick={() => onEditBill(bill)}
                    className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 text-slate-300 flex items-center justify-center transition cursor-pointer"
                    title={`Edit bill "${bill.name}"`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteBill(bill.id)}
                    className="w-8 h-8 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 flex items-center justify-center transition cursor-pointer"
                    title={`Delete bill "${bill.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {!billsToDisplay.length && (
            <div className="py-8 px-4 text-center text-slate-400 text-sm space-y-1">
              <p className="font-bold text-slate-200">No bills locked in this window</p>
              <p className="text-xs text-slate-400">
                Tap <strong className="text-cyan-300">+ Add Bill</strong> to protect rent, utilities, or loan payments before calculating your Walk-Away Limit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
