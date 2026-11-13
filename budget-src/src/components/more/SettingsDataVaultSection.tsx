import React from "react";
import { Download } from "lucide-react";

interface SettingsDataVaultSectionProps {
  txCount: number;
  dataSizeKb: number;
  isPro: boolean;
  isPaywallActive: boolean;
  onUpgradeClick?: () => void;
  onExportBackup: () => void;
  onExportCsv: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlimLedger?: (monthsOld: number) => void;
  onOpenEraseConfirm: () => void;
}

export const SettingsDataVaultSection: React.FC<SettingsDataVaultSectionProps> = ({
  txCount,
  dataSizeKb,
  isPro,
  isPaywallActive,
  onUpgradeClick,
  onExportBackup,
  onExportCsv,
  onImportBackup,
  onSlimLedger,
  onOpenEraseConfirm,
}) => {
  return (
    <div className="space-y-4">
      {!isPro && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 border border-sky-500/30 text-white shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <b className="text-base font-black text-white">The Next Step: Pro & VIP</b>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-slate-950 ${
                !isPaywallActive ? "bg-emerald-400" : "bg-rose-400"
              }`}
            >
              {!isPaywallActive ? "TRIAL ACTIVE" : "TRIAL ENDED"}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {isPaywallActive
              ? "Your 30-day trial has concluded. You are currently on the Free Tier (max 2 accounts). Upgrade to Pro or enter a VIP passcode to unlock everything and remove all ads."
              : "You are currently enjoying your 30-day unrestricted trial. Enter a VIP passcode or upgrade to remove ads and ensure uninterrupted unlimited access."}
          </p>
          {onUpgradeClick && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-xs font-black text-slate-950 shadow-md transition cursor-pointer"
            >
              <span>Unlock Pro / Enter VIP Passcode</span>
            </button>
          )}
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs space-y-3">
        <b className="block text-base font-black text-slate-900">Save & Backup Your Work</b>
        <p className="text-xs leading-relaxed text-slate-600">
          Your data is stored privately on your device. Download a backup file anytime to keep a copy in your personal files.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExportBackup}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>Backup JSON</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>Export CSV</span>
          </button>
        </div>
        <label className="block pt-1 text-center text-xs font-bold text-cyan-700 hover:underline cursor-pointer">
          <span>Restore from JSON Backup File</span>
          <input type="file" accept=".json" onChange={onImportBackup} className="hidden" />
        </label>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <b className="block text-base font-black text-slate-900">Slim Down & Archive Ledger</b>
            <span className="text-xs text-slate-500">Keep balances exact, archive & purge old transactions</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-700 shrink-0">
            {txCount} txs · {dataSizeKb} KB
          </span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <span className="flex items-center gap-1.5 font-bold text-emerald-800">
            <span>🛡️</span> Zero Image Bloat (Receipt Photos Are Never Saved)
          </span>
          <p className="leading-relaxed text-emerald-700">
            Receipt photos are held in temporary memory only while reviewing extracted fields and immediately discarded on save.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onSlimLedger?.(6)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-900 transition cursor-pointer"
          >
            <span>⚡ Slim Entries Older Than 6 Months</span>
          </button>
          <button
            type="button"
            onClick={() => onSlimLedger?.(12)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-900 transition cursor-pointer"
          >
            <span>⚡ Slim Entries Older Than 1 Year</span>
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs space-y-2">
        <b className="block text-sm font-black text-rose-900">Erase Budget Ledger Data</b>
        <p className="text-xs text-rose-700">
          Wipe transactions, bills, goals, and rules back to a clean starter Checking & Savings. Your Pro / VIP membership status is never erased.
        </p>
        <button
          type="button"
          onClick={onOpenEraseConfirm}
          className="w-full py-2.5 mt-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white shadow-sm transition cursor-pointer"
        >
          Erase Budget Data
        </button>
      </div>
    </div>
  );
};
