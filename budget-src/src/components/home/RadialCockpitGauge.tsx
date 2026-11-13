import React from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { MoreSubPage, NavigationTab, PayPeriodInfo } from "../../types";
import { formatMoney } from "../../utils/money";

interface RadialCockpitGaugeProps {
  availableCash: number;
  billsThisPeriodTotal: number;
  goalAllocations: number;
  freeToSpend: number;
  dailySafePace: number;
  payPeriod: PayPeriodInfo;
  onOpenPayPeriodModal: () => void;
  onOpenBreakdown: () => void;
  onNavigateToTab: (tab: NavigationTab, subPage?: MoreSubPage) => void;
}

export const RadialCockpitGauge: React.FC<RadialCockpitGaugeProps> = ({
  availableCash,
  billsThisPeriodTotal,
  goalAllocations,
  freeToSpend,
  dailySafePace,
  payPeriod,
  onOpenPayPeriodModal,
  onOpenBreakdown,
  onNavigateToTab,
}) => {
  const totalCommitments = billsThisPeriodTotal + goalAllocations;
  const totalPool = Math.max(1, availableCash, totalCommitments + Math.max(0, freeToSpend));
  const freeRatio =
    freeToSpend <= 0
      ? availableCash > 0 ? 0.08 : 0.04
      : Math.min(1, Math.max(0.12, freeToSpend / totalPool));

  const periodProgressRatio = Math.min(
    100,
    Math.max(
      8,
      Math.round(
        (((payPeriod.totalDays || 14) - (payPeriod.daysLeft || 0)) /
          Math.max(1, payPeriod.totalDays || 14)) *
          100
      )
    )
  );

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (240 / 360) * circumference;
  const filledArc = arcLength * freeRatio;

  const summaryItems = [
    { label: "Liquid Cash", value: formatMoney(availableCash), color: "text-emerald-300", onClick: () => onNavigateToTab("accounts") },
    { label: "Bills Locked", value: `-${formatMoney(billsThisPeriodTotal)}`, color: "text-amber-300", onClick: () => onNavigateToTab("calendar") },
    { label: "Goal Plan", value: `-${formatMoney(goalAllocations)}`, color: "text-cyan-300", onClick: () => onNavigateToTab("more", "goals") },
  ];

  return (
    <div className="relative overflow-hidden flex-1 flex flex-col justify-between min-h-[21rem] p-5 rounded-[2.25rem] bg-gradient-to-b from-[#0c1d36]/95 via-[#071222]/95 to-[#040a14]/95 border border-cyan-400/25 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 right-0 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 p-0.5 rounded-full overflow-hidden bg-slate-950 border border-amber-400/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] shrink-0">
            <img
              src={`${import.meta.env.BASE_URL || "/"}assets/aistudio/The_Next_Step_Logo_Engraved_a3596208.png`}
              alt="The Next Step Crest"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-amber-300">THE NEXT STEP</div>
            <div className="text-xs font-extrabold text-slate-300">Walk-Away Protection Engine</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPayPeriodModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/15 border border-cyan-400/30 backdrop-blur-md text-xs font-bold text-cyan-200 transition cursor-pointer"
          title="Change Pay Period Schedule"
        >
          <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
          <span>{payPeriod.label}</span>
        </button>
      </div>

      <div onClick={onOpenBreakdown} className="relative z-10 flex flex-col items-center justify-center my-1 select-none cursor-pointer group">
        <div className="relative flex items-center justify-center w-56 h-44">
          <svg className="w-56 h-56 -mt-4 overflow-visible" viewBox="0 0 220 220">
            <defs>
              <linearGradient id="tnsGaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="55%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="tnsDangerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
            <circle cx="110" cy="115" r={radius} fill="none" stroke="rgba(148, 163, 184, 0.14)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${arcLength} ${circumference}`} transform="rotate(150 110 115)" />
            <circle cx="110" cy="115" r={radius} fill="none" stroke={freeToSpend < 0 ? "url(#tnsDangerGrad)" : "url(#tnsGaugeGrad)"} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${filledArc} ${circumference}`} transform="rotate(150 110 115)" className="transition-all duration-700 ease-out drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 text-center">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300/90">Free To Spend</span>
            <strong className={`mt-0.5 text-4xl font-black tracking-tight tabular-nums ${freeToSpend < 0 ? "text-rose-400" : "text-white"}`}>
              {formatMoney(freeToSpend)}
            </strong>
            <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/15 group-hover:bg-cyan-400/25 border border-cyan-400/30 text-[0.68rem] font-bold text-cyan-200 transition">
              <span>{formatMoney(dailySafePace)}/day safe pace</span>
              <ChevronRight className="w-3 h-3 text-cyan-300" />
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs mx-auto -mt-1 space-y-1">
          <div className="flex items-center justify-between px-1 text-[0.68rem] font-bold text-slate-400">
            <span>{payPeriod.daysLeft > 0 ? `${payPeriod.daysLeft}d until payday (${payPeriod.nextPayday})` : "Payday is today!"}</span>
            <span className="text-cyan-300">{periodProgressRatio}% of cycle</span>
          </div>
          <div className="w-full h-1.5 p-0.5 rounded-full overflow-hidden bg-slate-800/90">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 transition-all duration-500" style={{ width: `${periodProgressRatio}%` }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 pt-3 mt-2 border-t border-white/10 divide-x divide-white/10 text-center">
        {summaryItems.map((item) => (
          <button key={item.label} type="button" onClick={item.onClick} className="px-2 hover:opacity-85 transition cursor-pointer">
            <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
            <strong className={`block mt-0.5 text-sm font-black tabular-nums ${item.color}`}>{item.value}</strong>
          </button>
        ))}
      </div>
    </div>
  );
};
