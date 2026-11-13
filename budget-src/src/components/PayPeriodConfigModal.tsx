import React, { useState, useEffect } from "react";
import { X, CalendarDays, CheckCircle2 } from "lucide-react";
import { PayPeriodFrequency, PayPeriodSettings } from "../types";
import { calculateCurrentPayPeriod, getTodayStr } from "../utils/payPeriod";

interface PayPeriodConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PayPeriodSettings;
  onSave: (updated: PayPeriodSettings) => void;
}

export const PayPeriodConfigModal: React.FC<PayPeriodConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [frequency, setFrequency] = useState<PayPeriodFrequency>(settings.frequency || "biweekly");
  const [anchorDate, setAnchorDate] = useState<string>(settings.anchorDate || getTodayStr());

  useEffect(() => {
    if (isOpen) {
      setFrequency(settings.frequency || "biweekly");
      setAnchorDate(settings.anchorDate || getTodayStr());
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  // Live preview of the calculation
  const preview = calculateCurrentPayPeriod({ frequency, anchorDate });

  const handleSave = () => {
    onSave({
      frequency,
      anchorDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payperiod-modal-title"
        className="bg-white rounded-[26px] max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-600" />
            <h3 id="payperiod-modal-title" className="text-xl font-black text-slate-900">
              Set Your Pay Period
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close pay period modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-slate-600 leading-relaxed">
            The dashboard and calendar use your active pay period to track free-to-spend cash and bills. Your device clock keeps it auto-updating continuously with zero outside links.
          </p>

          {/* Frequency selector */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5">
              How often are you paid?
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "weekly", label: "Weekly", sub: "Every 7 days" },
                { id: "biweekly", label: "Bi-Weekly", sub: "Every 14 days" },
                { id: "monthly", label: "Monthly", sub: "Once a month" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFrequency(opt.id as PayPeriodFrequency)}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    frequency === opt.id
                      ? "bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400 text-cyan-950 font-black"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
                  }`}
                >
                  <span className="text-sm font-black">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Anchor / Start Date */}
          <div>
            <label htmlFor="payperiod-anchor-input" className="text-xs font-bold text-slate-700 block mb-1">
              {frequency === "monthly" ? "Start day of the month / Payday" : "Known payday or period start date"}
            </label>
            <input
              id="payperiod-anchor-input"
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Pick any past or present payday. The app calculates all cycles from here.
            </span>
          </div>

          {/* Dynamic Live Preview Box */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-900 font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-cyan-700" />
              <span>Current Cycle Preview</span>
            </div>
            <div className="text-sm text-slate-900 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Active Period:</span>
                <span className="text-cyan-900 font-black">{preview.label}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Days Remaining:</span>
                <span className="font-bold text-slate-800">{preview.daysLeft} days left in cycle</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Next Payday:</span>
                <span className="font-bold text-emerald-700">{preview.nextPayday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-black py-2.5 rounded-xl transition cursor-pointer shadow-md text-sm"
          >
            Save Pay Period ✓
          </button>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
