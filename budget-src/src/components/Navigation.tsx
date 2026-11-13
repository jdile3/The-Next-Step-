import React from "react";
import { Menu, Calendar as CalendarIcon, Home as HomeIcon, CreditCard, MoreHorizontal } from "lucide-react";
import { NavigationTab } from "../types";

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-2.5 left-0 right-0 px-3 pb-[env(safe-area-inset-bottom)] z-40 pointer-events-none">
      <nav className="pointer-events-auto max-w-xl mx-auto h-[4.4rem] rounded-full bg-[#071324]/90 backdrop-blur-2xl border border-cyan-400/20 shadow-[0_16px_40px_rgba(0,0,0,0.8)] grid grid-cols-5 items-center px-2">
        {/* 1. Transactions */}
        <button
          onClick={() => onTabChange("transactions")}
          className={`h-[3.3rem] flex flex-col items-center justify-center transition-all cursor-pointer rounded-full ${
            activeTab === "transactions"
              ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Menu className={`w-5 h-5 mb-0.5 ${activeTab === "transactions" ? "text-cyan-300" : "text-slate-400"}`} />
          <span className={`text-[0.68rem] font-extrabold leading-none ${activeTab === "transactions" ? "text-cyan-300" : "text-slate-400"}`}>
            Ledger
          </span>
        </button>

        {/* 2. Calendar */}
        <button
          onClick={() => onTabChange("calendar")}
          className={`h-[3.3rem] flex flex-col items-center justify-center transition-all cursor-pointer rounded-full ${
            activeTab === "calendar"
              ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CalendarIcon className={`w-5 h-5 mb-0.5 ${activeTab === "calendar" ? "text-cyan-300" : "text-slate-400"}`} />
          <span className={`text-[0.68rem] font-extrabold leading-none ${activeTab === "calendar" ? "text-cyan-300" : "text-slate-400"}`}>
            Calendar
          </span>
        </button>

        {/* 3. Home (Floating Neon Orb) */}
        <button
          onClick={() => onTabChange("home")}
          className="relative -top-2.5 flex items-center justify-center cursor-pointer group"
          title="Home"
        >
          <div
            className={`w-[3.85rem] h-[3.85rem] rounded-full transition-all transform group-active:scale-95 flex items-center justify-center border-[3px] border-[#050d1a] ${
              activeTab === "home"
                ? "bg-gradient-to-tr from-cyan-400 via-sky-300 to-emerald-300 text-[#040d1a] shadow-[0_0_25px_rgba(34,211,238,0.65)] ring-2 ring-cyan-300/60"
                : "bg-gradient-to-tr from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-[#040d1a] shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
            }`}
          >
            <HomeIcon className="w-7 h-7 fill-current stroke-[2.2] text-[#040d1a]" />
          </div>
        </button>

        {/* 4. Accounts */}
        <button
          onClick={() => onTabChange("accounts")}
          className={`h-[3.3rem] flex flex-col items-center justify-center transition-all cursor-pointer rounded-full ${
            activeTab === "accounts"
              ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CreditCard className={`w-5 h-5 mb-0.5 ${activeTab === "accounts" ? "text-cyan-300" : "text-slate-400"}`} />
          <span className={`text-[0.68rem] font-extrabold leading-none ${activeTab === "accounts" ? "text-cyan-300" : "text-slate-400"}`}>
            Vault
          </span>
        </button>

        {/* 5. More */}
        <button
          onClick={() => onTabChange("more")}
          className={`h-[3.3rem] flex flex-col items-center justify-center transition-all cursor-pointer rounded-full ${
            activeTab === "more"
              ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.2)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 mb-0.5 ${activeTab === "more" ? "text-cyan-300" : "text-slate-400"}`} />
          <span className={`text-[0.68rem] font-extrabold leading-none ${activeTab === "more" ? "text-cyan-300" : "text-slate-400"}`}>
            Command
          </span>
        </button>
      </nav>
    </div>
  );
};
