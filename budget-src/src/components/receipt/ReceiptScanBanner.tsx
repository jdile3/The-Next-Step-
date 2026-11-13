import React from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { ReceiptScanStatus } from "../../hooks/useReceiptScanner";

interface ReceiptScanBannerProps {
  status: ReceiptScanStatus;
  progress: number;
  label: string;
  fieldsFound: { merchant: boolean; amount: boolean; date: boolean };
  onRetryScan: () => void;
}

export const ReceiptScanBanner: React.FC<ReceiptScanBannerProps> = ({
  status,
  progress,
  label,
  fieldsFound,
  onRetryScan,
}) => {
  if (status === "loading") {
    return (
      <div role="status" aria-live="polite" className="rounded-xl bg-sky-50 border border-sky-200 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
            <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
            <span>{label || "Scanning receipt for Vendor, Date & Total..."}</span>
          </div>
          <span className="text-[11px] font-black text-sky-700">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-sky-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-600 transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(10, Math.min(100, progress))}%` }}
          />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <p className="font-bold">Could not auto-scan receipt image.</p>
            <p className="text-[11px] text-rose-700">You can type into the fields below or retry scanning.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetryScan}
          className="shrink-0 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div role="status" aria-live="polite" className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">No clear receipt text detected.</p>
            <p className="text-[11px] text-amber-800">Enter the Vendor, Date, and Total below, or retake a closer photo.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetryScan}
          className="shrink-0 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rescan</span>
        </button>
      </div>
    );
  }

  const badges = [
    { label: `Vendor ${fieldsFound.merchant ? "Found" : "Manual"}`, active: fieldsFound.merchant },
    { label: `Date ${fieldsFound.date ? "Found" : "Today"}`, active: fieldsFound.date },
    { label: `Total ${fieldsFound.amount ? "Found" : "Manual"}`, active: fieldsFound.amount },
  ];

  return (
    <div role="status" aria-live="polite" className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Auto-Filled from Receipt — Review or Edit Below</span>
        </div>
        <button
          type="button"
          onClick={onRetryScan}
          className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1.5 py-0.5"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Rescan</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {badges.map((b) => (
          <span
            key={b.label}
            className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
              b.active ? "bg-emerald-200/70 text-emerald-900" : "bg-slate-200 text-slate-600"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{b.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
