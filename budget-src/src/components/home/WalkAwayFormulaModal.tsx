import React from "react";
import { X } from "lucide-react";
import { PayPeriodInfo } from "../../types";
import { formatMoney } from "../../utils/money";

interface WalkAwayFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  payPeriod: PayPeriodInfo;
  availableCash: number;
  billsThisPeriodTotal: number;
  goalAllocations: number;
  freeToSpend: number;
  dailySafePace: number;
  daysRemainingSafe: number;
}

export const WalkAwayFormulaModal: React.FC<WalkAwayFormulaModalProps> = ({
  isOpen,
  onClose,
  payPeriod,
  availableCash,
  billsThisPeriodTotal,
  goalAllocations,
  freeToSpend,
  dailySafePace,
  daysRemainingSafe,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-md max-h-[85vh] overflow-hidden rounded-[2rem] bg-[#091526] border border-cyan-400/30 text-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h3 className="text-lg font-black text-white">Walk-Away Limit Formula</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
            aria-label="Close formula modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-3 text-sm">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
            Active pay cycle: <b className="text-cyan-300">{payPeriod.label}</b> ({payPeriod.totalDays} days).
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="font-semibold text-slate-300">Liquid Cash (Active Accounts):</span>
            <b className="text-base font-black tabular-nums text-emerald-300">{formatMoney(availableCash)}</b>
          </div>

          <div className="flex items-center justify-between py-1.5 text-amber-300">
            <span className="font-semibold">Minus Unpaid Bills in This Period:</span>
            <b className="text-base font-black tabular-nums">-{formatMoney(billsThisPeriodTotal)}</b>
          </div>

          <div className="flex items-center justify-between py-1.5 text-cyan-300">
            <span className="font-semibold">Minus Active Goal Locks:</span>
            <b className="text-base font-black tabular-nums">-{formatMoney(goalAllocations)}</b>
          </div>

          <div className="flex items-center justify-between p-4 pt-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/35">
            <div>
              <span className="block text-sm font-black text-white">SAFE WALK-AWAY LIMIT:</span>
              <span className="text-xs text-cyan-200">
                {formatMoney(dailySafePace)}/day for {daysRemainingSafe}d
              </span>
            </div>
            <b className="text-2xl font-black tabular-nums text-cyan-300">{formatMoney(freeToSpend)}</b>
          </div>
          <p className="text-xs italic leading-relaxed text-slate-400">
            Once you check off a bill as Paid in the Calendar, it deducts directly from Liquid Cash and is removed from Unpaid Bills so it is never subtracted twice.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-950/60 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-sm font-black text-slate-950 shadow-lg cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
