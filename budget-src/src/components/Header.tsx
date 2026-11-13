import React from "react";
import { Grid, Smartphone, Sparkles, Lock, Star, RefreshCw } from "lucide-react";
import { NavigationTab, MoreSubPage } from "../types";

interface HeaderProps {
  activeTab: NavigationTab;
  moreSubPage: MoreSubPage;
  onOpenCalc: () => void;
  onOpenInstallModal?: () => void;
  onOpenSyncModal?: () => void;
  isPro?: boolean;
  daysRemaining?: number;
  isTrialActive?: boolean;
  onOpenUpgradeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  moreSubPage,
  onOpenCalc,
  onOpenInstallModal,
  onOpenSyncModal,
  isPro = false,
  daysRemaining = 30,
  isTrialActive = true,
  onOpenUpgradeModal,
}) => {
  const getTitle = () => {
    if (activeTab === "home") return "Home";
    if (activeTab === "transactions") return "Transactions";
    if (activeTab === "calendar") return "Calendar";
    if (activeTab === "accounts") return "Accounts";
    if (moreSubPage === "bills") return "Bills & Loans";
    if (moreSubPage === "goals") return "Goals & What-If";
    if (moreSubPage === "insights") return "Reality Check";
    if (moreSubPage === "settings") return "Settings";
    return "More";
  };

  const logoSrc = `${import.meta.env.BASE_URL || "/"}assets/aistudio/The_Next_Step_Logo_Engraved_a3596208.png`;

  const tabOrder: NavigationTab[] = ["transactions", "calendar", "home", "accounts", "more"];

  return (
    <header className="sticky top-0 z-40 bg-[#050d1a]/85 backdrop-blur-xl border-b border-white/10 text-white h-[4.35rem] px-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.45)] shrink-0">
      <div
        onClick={onOpenInstallModal}
        className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-950 border border-cyan-400/35 shadow-[0_0_15px_rgba(34,211,238,0.18)] flex items-center justify-center shrink-0 cursor-pointer hover:border-cyan-300 transition"
        title="App Info & Installation"
      >
        <img src={logoSrc} alt="The Next Step Logo" className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 px-2">
        <h1 className="text-base font-black tracking-wide text-white uppercase whitespace-nowrap leading-none">
          {getTitle()}
        </h1>
        <div className="flex items-center gap-1.5 mt-1.5" title="Swipe left or right to switch tabs">
          {tabOrder.map((t) => (
            <span
              key={t}
              className={`h-1 rounded-full transition-all duration-300 ${
                activeTab === t
                  ? "w-5 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  : "w-1.5 bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* When Pro is unlocked, display a static non-clickable PRO emblem that opens nothing */}
        {isPro ? (
          <div
            className="h-10 px-3 rounded-full text-xs font-black flex items-center gap-1 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 border border-amber-200 select-none shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            title="Lifetime Pro Active"
          >
            <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>PRO</span>
          </div>
        ) : (
          onOpenUpgradeModal && (
            <button
              onClick={onOpenUpgradeModal}
              className={`h-10 px-3 rounded-full text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-xs ${
                isTrialActive
                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/35"
                  : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/35"
              }`}
              title="Trial & Pro Upgrade"
            >
              {isTrialActive ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{daysRemaining}d</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-300" />
                  <span>Pro</span>
                </>
              )}
            </button>
          )
        )}

        {onOpenSyncModal && (
          <button
            onClick={onOpenSyncModal}
            className="w-10 h-10 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-300 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
            title="Sync Phone & Computer Hub"
          >
            <RefreshCw className="w-4 h-4 text-amber-300" />
          </button>
        )}

        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="w-10 h-10 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-sky-400 flex items-center justify-center transition cursor-pointer"
            title="Install & Share App"
          >
            <Smartphone className="w-4 h-4 text-sky-300" />
          </button>
        )}

        <button
          onClick={onOpenCalc}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
          title="Open Calculator"
        >
          <Grid className="w-4 h-4 text-white" />
        </button>
      </div>
    </header>
  );
};
