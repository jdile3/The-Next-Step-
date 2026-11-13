import React from "react";
import { ArrowLeft, Clock, Compass, ShieldAlert } from "lucide-react";
import { AppSettings, MoreSubPage, PayPeriodInfo, Transaction } from "../../types";
import { formatMoney } from "../../utils/money";
import { CategoryBurnGrid } from "./CategoryBurnGrid";

interface RealityCheckSubPageProps {
  settings: AppSettings;
  transactions: Transaction[];
  payPeriod: PayPeriodInfo;
  freeToSpend: number;
  billsThisPeriodTotal: number;
  allCategories: string[];
  trackedHabitCategory: string;
  habitPayPeriodTotal: number;
  habitMonthTotal: number;
  onBack: () => void;
  onNavigateSubPage: (page: MoreSubPage) => void;
  onUpdateSettings: (next: AppSettings) => void;
}

export const RealityCheckSubPage: React.FC<RealityCheckSubPageProps> = ({
  settings,
  transactions,
  payPeriod,
  freeToSpend,
  billsThisPeriodTotal,
  allCategories,
  trackedHabitCategory,
  habitPayPeriodTotal,
  habitMonthTotal,
  onBack,
  onNavigateSubPage,
  onUpdateSettings,
}) => {
  const walkAwayLimit = freeToSpend > 0 ? freeToSpend : 0;
  const habitAnnualBurn = habitMonthTotal * 12;
  const hourlyRate = Number(settings.hourlyRate) || 0;
  const hoursTraded = hourlyRate > 0 ? habitMonthTotal / hourlyRate : 0;
  const shiftsTraded = hourlyRate > 0 ? hoursTraded / 8 : 0;

  const statCards = [
    { label: "This Pay Period", value: habitPayPeriodTotal, sub: payPeriod.label },
    { label: "This Month", value: habitMonthTotal, sub: "Calendar Month" },
    { label: "Annual Burn", value: habitAnnualBurn, sub: "12-Mo Projected" },
  ];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-cyan-800 hover:text-cyan-950 shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to More</span>
      </button>

      <div>
        <h2 className="text-2xl font-black text-white">Reality Check & Leak Mirror</h2>
        <p className="text-xs text-slate-300">Unfiltered spending transparency, stop-loss limits, and hours worked</p>
      </div>

      <div
        className={`p-5 rounded-2xl border shadow-sm ${
          freeToSpend > 0 ? "bg-[#061629] text-white border-slate-700/80" : "bg-rose-950/80 text-white border-rose-500/60"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-black uppercase tracking-wider ${
              freeToSpend > 0 ? "bg-sky-500/20 text-sky-300 border-sky-400/30" : "bg-rose-500/20 text-rose-300 border-rose-400/30"
            }`}
          >
            {freeToSpend > 0 ? <Compass className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{freeToSpend > 0 ? "Walk-Away Limit Tonight" : "Stop-Loss Limit Reached"}</span>
          </span>
          <span className="text-xs text-slate-400">Survival Cushion</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <b className={`text-3xl font-black ${freeToSpend > 0 ? "text-white" : "text-rose-400"}`}>{formatMoney(walkAwayLimit)}</b>
          <span className="text-xs text-slate-400">max safe spend</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-300">
          {freeToSpend > 0
            ? `Unpaid survival bills require ${formatMoney(billsThisPeriodTotal)} this period. Spending above ${formatMoney(freeToSpend)} touches bill money.`
            : `Caution: Unpaid survival bills (${formatMoney(billsThisPeriodTotal)}) equal or exceed cash. Discretionary limit is $0.00.`}
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <b className="block text-base font-black text-slate-900">Habit Burn Mirror</b>
            <span className="text-xs text-slate-500">Select any category to track without judgment</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="reality-habit-select" className="text-xs font-bold text-slate-600 shrink-0">Track:</label>
            <select
              id="reality-habit-select"
              value={trackedHabitCategory}
              onChange={(e) => onUpdateSettings({ ...settings, trackedHabitCategory: e.target.value })}
              className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-bold text-slate-950 outline-none cursor-pointer [color-scheme:light]"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-white text-slate-950">{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {statCards.map((sc) => (
            <div key={sc.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="block truncate text-[10px] font-black uppercase text-slate-500">{sc.label}</span>
              <b className="block mt-1 text-base sm:text-lg font-black text-slate-900">{formatMoney(sc.value)}</b>
              <span className="block mt-0.5 truncate text-[10px] text-slate-400">{sc.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <b className="text-base font-black text-slate-900">Life Hours Traded</b>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        {hourlyRate > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">~{hoursTraded.toFixed(1)} hrs</span>
              <span className="text-xs font-semibold text-slate-500">(approx. {shiftsTraded.toFixed(1)} shifts)</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              At <strong className="text-slate-900">{formatMoney(hourlyRate)}/hr</strong>, this month&apos;s <strong className="text-slate-900">{formatMoney(habitMonthTotal)}</strong> on <strong className="text-slate-900">{trackedHabitCategory}</strong> equals <strong className="text-slate-900">{hoursTraded.toFixed(1)} hours</strong> worked.
            </p>
          </div>
        ) : (
          <button type="button" onClick={() => onNavigateSubPage("settings")} className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer">
            Set your take-home hourly wage in Settings →
          </button>
        )}
      </div>

      <CategoryBurnGrid transactions={transactions} hourlyRate={hourlyRate} />
    </div>
  );
};
