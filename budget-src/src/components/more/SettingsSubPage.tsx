import React, { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { AppData, AppSettings, PayPeriodInfo } from "../../types";
import { SettingsDataVaultSection } from "./SettingsDataVaultSection";

interface SettingsSubPageProps {
  data: AppData;
  payPeriod: PayPeriodInfo;
  allCategories: string[];
  trackedHabitCategory: string;
  dataSizeKb: number;
  isPro: boolean;
  isPaywallActive: boolean;
  onBack: () => void;
  onOpenPayPeriodModal: () => void;
  onUpdateSettings: (next: AppSettings) => void;
  onDeleteVendorRule: (vendorKey: string) => void;
  onUpgradeClick?: () => void;
  onExportBackup: () => void;
  onExportCsv: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlimLedger?: (monthsOld: number) => void;
  onOpenEraseConfirm: () => void;
}

export const SettingsSubPage: React.FC<SettingsSubPageProps> = (props) => {
  const { data, payPeriod, allCategories, trackedHabitCategory, onUpdateSettings } = props;
  const [ruleSearch, setRuleSearch] = useState("");

  const filteredVendorRules = useMemo(() => {
    const entries = Object.entries(data.merchantRules || {});
    if (!ruleSearch.trim()) return entries;
    const q = ruleSearch.toLowerCase();
    return entries.filter(
      ([vendor, cat]) => vendor.toLowerCase().includes(q) || String(cat).toLowerCase().includes(q)
    );
  }, [data.merchantRules, ruleSearch]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={props.onBack}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-cyan-800 hover:text-cyan-950 shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to More</span>
      </button>

      <h2 className="text-2xl font-black text-white">Settings</h2>

      <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs">
        <div>
          <b className="block text-base font-black text-slate-900">Pay Period & Payday</b>
          <span className="text-xs text-slate-500">{payPeriod.formattedRange} · Next: {payPeriod.nextPayday}</span>
        </div>
        <button
          type="button"
          onClick={props.onOpenPayPeriodModal}
          className="px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-xs font-bold text-cyan-900 transition cursor-pointer"
        >
          Change Schedule
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs space-y-2">
        <label htmlFor="settings-hourly-wage" className="block text-sm font-black text-slate-900">
          Work Wage / Hourly Rate ($)
        </label>
        <input
          id="settings-hourly-wage"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={data.settings.hourlyRate ? data.settings.hourlyRate : ""}
          onChange={(e) =>
            onUpdateSettings({
              ...data.settings,
              hourlyRate: e.target.value === "" ? 0 : Number(e.target.value) || 0,
            })
          }
          className="w-full p-2.5 rounded-xl bg-white text-slate-950 border-2 border-slate-300 text-sm font-bold placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 [color-scheme:light]"
        />
        <span className="block text-xs text-slate-500">Optional · Translates spending into hours worked</span>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs space-y-3">
        <div>
          <b className="block text-base font-black text-slate-900">Vendor & Category Rules</b>
          <span className="text-xs text-slate-500">Custom rules saved alongside smart merchant categorization</span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            aria-label="Search vendor rules"
            placeholder="Search vendor rules..."
            value={ruleSearch}
            onChange={(e) => setRuleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white text-slate-950 placeholder:text-slate-400 border border-slate-300 text-xs font-semibold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
          />
        </div>
        <div className="max-h-56 overflow-y-auto p-1 rounded-xl bg-slate-50/50 border border-slate-200 divide-y divide-slate-100">
          {filteredVendorRules.map(([vendor, cat]) => (
            <div key={vendor} className="flex items-center justify-between p-2.5 my-0.5 rounded-lg bg-white text-xs">
              <div>
                <b className="block font-black uppercase text-slate-900">{vendor}</b>
                <span className="font-semibold text-cyan-800">{cat}</span>
              </div>
              <button
                type="button"
                onClick={() => props.onDeleteVendorRule(vendor)}
                className="p-1 text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
          {filteredVendorRules.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">No custom vendor rules yet.</div>
          )}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="settings-habit-category" className="text-sm font-black text-slate-900">
            Default Tracked Habit Category
          </label>
          <select
            id="settings-habit-category"
            value={trackedHabitCategory}
            onChange={(e) => onUpdateSettings({ ...data.settings, trackedHabitCategory: e.target.value })}
            className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-bold text-slate-950 outline-none cursor-pointer [color-scheme:light]"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-white text-slate-950">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <SettingsDataVaultSection
        txCount={data.transactions.length}
        dataSizeKb={props.dataSizeKb}
        isPro={props.isPro}
        isPaywallActive={props.isPaywallActive}
        onUpgradeClick={props.onUpgradeClick}
        onExportBackup={props.onExportBackup}
        onExportCsv={props.onExportCsv}
        onImportBackup={props.onImportBackup}
        onSlimLedger={props.onSlimLedger}
        onOpenEraseConfirm={props.onOpenEraseConfirm}
      />
    </div>
  );
};
