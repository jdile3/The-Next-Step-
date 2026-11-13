import React from "react";
import { ArrowUpRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { MoreSubPage, NavigationTab } from "../../types";
import { formatMoney } from "../../utils/money";

interface TelemetryStreamDeckProps {
  activeAccountsCount: number;
  availableCash: number;
  billsThisPeriodTotal: number;
  spentThisPeriodTotal: number;
  spentThisPeriodCount: number;
  onNavigateToTab: (tab: NavigationTab, subPage?: MoreSubPage) => void;
}

export const TelemetryStreamDeck: React.FC<TelemetryStreamDeckProps> = ({
  activeAccountsCount,
  availableCash,
  billsThisPeriodTotal,
  spentThisPeriodTotal,
  spentThisPeriodCount,
  onNavigateToTab,
}) => {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-[#091526]/90 backdrop-blur-xl border border-white/10 divide-y divide-white/8 shadow-xl">
      <button
        type="button"
        onClick={() => onNavigateToTab("accounts")}
        className="flex items-center justify-between gap-3 w-full p-3.5 px-4 hover:bg-white/5 text-left transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <b className="block text-xs font-extrabold text-white">Liquid Vault & Accounts</b>
            <span className="text-[0.7rem] font-medium text-slate-400">
              {activeAccountsCount} active accounts · Tap to manage or import CSV
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <strong className="block text-sm font-black tabular-nums text-emerald-300">
            {formatMoney(availableCash)}
          </strong>
          <span className="inline-flex items-center gap-0.5 text-[0.65rem] font-bold text-slate-400">
            Open <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onNavigateToTab("calendar")}
        className="flex items-center justify-between gap-3 w-full p-3.5 px-4 hover:bg-white/5 text-left transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <b className="block text-xs font-extrabold text-white">Unpaid Bills in This Period</b>
            <span className="text-[0.7rem] font-medium text-slate-400">
              Locked aside before calculating Free-to-Spend
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <strong className="block text-sm font-black tabular-nums text-amber-300">
            {formatMoney(billsThisPeriodTotal)}
          </strong>
          <span className="inline-flex items-center gap-0.5 text-[0.65rem] font-bold text-slate-400">
            Calendar <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onNavigateToTab("transactions")}
        className="flex items-center justify-between gap-3 w-full p-3.5 px-4 hover:bg-white/5 text-left transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400/35 text-cyan-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <b className="block text-xs font-extrabold text-white">Spent This Pay Period</b>
            <span className="text-[0.7rem] font-medium text-slate-400">
              {spentThisPeriodCount} {spentThisPeriodCount === 1 ? "entry" : "entries"} logged · Tap for full ledger & receipt scan
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <strong className="block text-sm font-black tabular-nums text-cyan-300">
            {formatMoney(spentThisPeriodTotal)}
          </strong>
          <span className="inline-flex items-center gap-0.5 text-[0.65rem] font-bold text-slate-400">
            Ledger <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </button>
    </div>
  );
};
