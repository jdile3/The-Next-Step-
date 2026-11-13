import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Goal, Transaction } from "../types";
import { formatMoney, parseMoney } from "../utils/money";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositTransactions: Transaction[];
  initialData?: Goal | null;
  onSave: (goal: Partial<Goal>) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  depositTransactions,
  initialData,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState(`${new Date().getFullYear()}-12-31`);
  const [amountPerPayPeriod, setAmountPerPayPeriod] = useState("");
  const [status, setStatus] = useState<"what_if" | "on_plan" | "completed">("what_if");
  const [assignedTxIds, setAssignedTxIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setTargetAmount(initialData ? String(initialData.targetAmount) : "");
      setTargetDate(initialData?.targetDate || `${new Date().getFullYear()}-12-31`);
      setAmountPerPayPeriod(initialData ? String(initialData.amountPerPayPeriod) : "");
      setStatus(initialData?.status || "what_if");
      setAssignedTxIds(initialData?.assignedTxIds || []);
      setErrorMsg("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    const target = Math.abs(parseMoney(targetAmount));
    if (!target || !name.trim()) {
      setErrorMsg("Please enter a goal name and a target dollar amount.");
      return;
    }

    onSave({
      id: initialData?.id || Date.now(),
      name: name.trim(),
      targetAmount: target,
      targetDate,
      amountPerPayPeriod: Math.abs(parseMoney(amountPerPayPeriod)),
      status,
      assignedTxIds,
      archived: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
        className="bg-white rounded-[26px] max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <h3 id="goal-modal-title" className="text-xl font-black text-slate-900">
            {initialData ? "Edit Goal" : "Add Goal"}
          </h3>
          <button
            type="button"
            aria-label="Close goal modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
          {errorMsg && (
            <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="goal-name-input" className="text-xs font-bold text-slate-700 block mb-1">
              Goal name
            </label>
            <input
              id="goal-name-input"
              type="text"
              placeholder="e.g. Emergency Fund, New Tires, CD Savings"
              value={name}
              onChange={(e) => {
                setErrorMsg("");
                setName(e.target.value);
              }}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 placeholder:text-slate-400 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
          </div>

          <div>
            <label htmlFor="goal-target-input" className="text-xs font-bold text-slate-700 block mb-1">
              Target amount ($)
            </label>
            <input
              id="goal-target-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => {
                setErrorMsg("");
                setTargetAmount(e.target.value);
              }}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 placeholder:text-slate-400 font-black focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
          </div>

          <div>
            <label htmlFor="goal-date-input" className="text-xs font-bold text-slate-700 block mb-1">
              Target date
            </label>
            <input
              id="goal-date-input"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
          </div>

          <div>
            <label htmlFor="goal-period-input" className="text-xs font-bold text-slate-700 block mb-1">
              Amount per pay period ($)
            </label>
            <input
              id="goal-period-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amountPerPayPeriod}
              onChange={(e) => setAmountPerPayPeriod(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 placeholder:text-slate-400 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
          </div>

          <div>
            <label htmlFor="goal-status-select" className="text-xs font-bold text-slate-700 block mb-1">
              Status
            </label>
            <select
              id="goal-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as "what_if" | "on_plan" | "completed")}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            >
              <option value="what_if" className="bg-white text-slate-950">What-If only (Keep separate from budget)</option>
              <option value="on_plan" className="bg-white text-slate-950">On the Plan (Add to Pay Period Budget)</option>
              <option value="completed" className="bg-white text-slate-950">Completed Goal</option>
            </select>
          </div>

          {/* Assign transfers checklist */}
          <div className="pt-2">
            <span className="text-xs font-black text-slate-800 block mb-1.5">
              Assign savings deposits to this goal:
            </span>
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-1.5">
              {depositTransactions.map((t) => {
                const isChecked = assignedTxIds.includes(t.id);
                return (
                  <label key={t.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...assignedTxIds, t.id]
                          : assignedTxIds.filter((id) => id !== t.id);
                        setAssignedTxIds(next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span>
                      {t.date} · {t.description} · {formatMoney(t.amount)}
                    </span>
                  </label>
                );
              })}
              {!depositTransactions.length && (
                <span className="text-[11px] text-slate-400">No deposit transfers recorded yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-sm text-sm"
          >
            {initialData ? "Save Changes" : "Save Goal"}
          </button>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-xl cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
