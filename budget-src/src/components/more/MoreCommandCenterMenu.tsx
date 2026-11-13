import React from "react";
import { ChevronRight, Clock, Compass, Download, Lock, Share2, ShieldAlert } from "lucide-react";
import { MoreSubPage } from "../../types";
import { AdBanner } from "../AdBanner";

interface MoreCommandCenterMenuProps {
  isPaywallActive: boolean;
  isPro: boolean;
  onSelectSubPage: (page: MoreSubPage) => void;
  onOpenSyncModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenShareModal?: () => void;
  onUpgradeClick?: () => void;
}

export const MoreCommandCenterMenu: React.FC<MoreCommandCenterMenuProps> = ({
  isPaywallActive,
  isPro,
  onSelectSubPage,
  onOpenSyncModal,
  onOpenInstallModal,
  onOpenShareModal,
  onUpgradeClick,
}) => {
  const handleProtectedNav = (target: MoreSubPage) => {
    if (isPaywallActive) {
      onUpgradeClick?.();
      return;
    }
    onSelectSubPage(target);
  };

  const deckItems = [
    { id: "bills" as MoreSubPage, protected: true, icon: <Clock className="w-5 h-5" />, iconStyle: "bg-amber-500/15 border-amber-400/35 text-amber-300", title: "Bills & Loans", subtitle: "Manage recurring survival bills and loan schedules" },
    { id: "goals" as MoreSubPage, protected: true, icon: <Compass className="w-5 h-5" />, iconStyle: "bg-emerald-500/15 border-emerald-400/35 text-emerald-300", title: "Goals & What-If Sandbox", subtitle: "Test savings goals without pretending money moved" },
    { id: "insights" as MoreSubPage, protected: true, icon: <ShieldAlert className="w-5 h-5" />, iconStyle: "bg-rose-500/15 border-rose-400/35 text-rose-300", title: "Reality Check Mirror", subtitle: "Habit burn mirror, walk-away limit & life-hours traded" },
    { id: "settings" as MoreSubPage, protected: false, icon: <Download className="w-5 h-5" />, iconStyle: "bg-cyan-500/15 border-cyan-400/35 text-cyan-300", title: "Settings & Vault Backups", subtitle: isPro ? "Pay period schedule, backups, vendor rules" : "Pay period schedule, VIP passcode, backups, vendor rules" },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between gap-4 animate-tab-enter">
      <div className="space-y-3.5">
        <div>
          <span className="block text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-400">SYSTEM & INSIGHTS</span>
          <h2 className="text-2xl font-black text-white">Command Center</h2>
        </div>

        <div className="space-y-2.5">
          {onOpenSyncModal && (
            <button type="button" onClick={onOpenSyncModal} className="flex items-center justify-between w-full p-4 rounded-[1.75rem] bg-gradient-to-r from-amber-950/80 via-[#0b172a] to-amber-950/70 border border-amber-400/40 hover:border-amber-300 text-left text-white shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-400/20 border border-amber-400/40 text-lg shrink-0">🔄</div>
                <div>
                  <div className="flex items-center gap-2">
                    <b className="block text-sm font-black text-white">Sync Phone & Computer</b>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[0.62rem] font-black uppercase tracking-wider text-slate-950">SYNC HUB</span>
                  </div>
                  <span className="text-xs font-medium text-amber-200/85">One-tap sync code or backup file to match your devices</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
            </button>
          )}

          {onOpenInstallModal && (
            <button type="button" onClick={onOpenInstallModal} className="flex items-center justify-between w-full p-4 rounded-[1.75rem] bg-gradient-to-r from-sky-950/80 via-[#0b172a] to-sky-950/70 border border-sky-400/40 hover:border-sky-300 text-left text-white shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-sky-400/20 border border-sky-400/40 text-lg shrink-0">📱</div>
                <div>
                  <b className="block text-sm font-black text-white">Install App on Phone or Computer</b>
                  <span className="text-xs font-medium text-sky-300">Add to your phone home screen or Windows desktop taskbar</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-sky-400 shrink-0" />
            </button>
          )}

          {onOpenShareModal && (
            <button type="button" onClick={onOpenShareModal} className="flex items-center justify-between w-full p-4 rounded-[1.75rem] bg-gradient-to-r from-purple-950/80 via-[#0b172a] to-purple-950/70 border border-purple-400/40 hover:border-purple-300 text-left text-white shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-purple-400/20 border border-purple-400/40 shrink-0">
                  <Share2 className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <b className="block text-sm font-black text-white">Share App with a Friend</b>
                  <span className="text-xs font-medium text-purple-300">Send link via text or show your QR code in 1 tap</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-400 shrink-0" />
            </button>
          )}

          <div className="overflow-hidden rounded-[2rem] bg-[#081426]/90 backdrop-blur-xl border border-white/10 divide-y divide-white/8 shadow-xl">
            {deckItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.protected ? handleProtectedNav(item.id) : onSelectSubPage(item.id))}
                className="flex items-center justify-between w-full p-4 px-5 hover:bg-white/5 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border shrink-0 ${item.iconStyle}`}>{item.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="block text-sm font-black text-white">{item.title}</b>
                      {item.protected && isPaywallActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[0.62rem] font-black uppercase text-amber-300">
                          <Lock className="w-3 h-3" /> Pro
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400">{item.subtitle}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isPro && onUpgradeClick && <AdBanner onUpgradeClick={onUpgradeClick} isPro={isPro} className="mt-2" />}
    </div>
  );
};
