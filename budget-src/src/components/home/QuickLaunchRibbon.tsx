import React from "react";
import { Camera, Compass, Flame, Plus, ShieldCheck } from "lucide-react";
import { MoreSubPage, NavigationTab } from "../../types";

interface QuickLaunchRibbonProps {
  onNavigateToTab: (tab: NavigationTab, subPage?: MoreSubPage) => void;
  onOpenAddTransaction?: () => void;
  onOpenReceiptScanner?: () => void;
  onOpenAddBill?: () => void;
}

export const QuickLaunchRibbon: React.FC<QuickLaunchRibbonProps> = ({
  onNavigateToTab,
  onOpenAddTransaction,
  onOpenReceiptScanner,
  onOpenAddBill,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[0.68rem] font-black uppercase tracking-widest text-slate-400">
          Swipe Quick Launch · Or Swipe Screen Left/Right
        </span>
        <span className="text-[0.68rem] font-bold text-cyan-400">⟷</span>
      </div>

      <div className="flex items-center gap-2.5 pb-1 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <button
          type="button"
          onClick={() =>
            onOpenAddTransaction ? onOpenAddTransaction() : onNavigateToTab("transactions")
          }
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] snap-start shrink-0 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Spend / Income</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onOpenReceiptScanner ? onOpenReceiptScanner() : onNavigateToTab("transactions")
          }
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0d1f38] hover:bg-[#132a4a] border border-emerald-400/50 text-xs font-bold text-emerald-200 snap-start shrink-0 active:scale-95 transition cursor-pointer"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Scan Receipt</span>
        </button>

        <button
          type="button"
          onClick={() => (onOpenAddBill ? onOpenAddBill() : onNavigateToTab("calendar"))}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0d1f38] hover:bg-[#132a4a] border border-amber-400/40 text-xs font-bold text-amber-200 snap-start shrink-0 active:scale-95 transition cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Protect a Bill</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToTab("more", "insights")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0d1f38] hover:bg-[#132a4a] border border-purple-400/40 text-xs font-bold text-purple-200 snap-start shrink-0 active:scale-95 transition cursor-pointer"
        >
          <Flame className="w-4 h-4 text-purple-400" />
          <span>Reality Check Mirror</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToTab("more", "goals")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0d1f38] hover:bg-[#132a4a] border border-emerald-400/40 text-xs font-bold text-emerald-200 snap-start shrink-0 active:scale-95 transition cursor-pointer"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>What-If Goal Sandbox</span>
        </button>
      </div>
    </div>
  );
};
