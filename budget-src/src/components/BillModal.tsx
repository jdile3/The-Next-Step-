import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Account, Bill } from "../types";
import { parseMoney } from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  initialData?: Bill | null;
  onSave: (bill: Partial<Bill>) => void;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  accounts,
  initialData,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [accountId, setAccountId] = useState<number | string>(accounts[0]?.id || 1);
  const [category, setCategory] = useState("Insurance");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setAmount(initialData ? String(initialData.amount) : "");
      setDueDay(initialData?.dueDay ? String(initialData.dueDay) : "1");
      setAccountId(initialData?.accountId ?? accounts[0]?.id ?? 1);
      setCategory(initialData?.category || "Insurance");
      setErrorMsg("");
    }
  }, [isOpen, initialData, accounts]);

  if (!isOpen) return null;

  const handleSave = () => {
    const positive = Math.abs(parseMoney(amount));
    if (!positive || !name.trim()) {
      setErrorMsg("Please enter both a bill name and a monthly dollar amount.");
      return;
    }

    const dayNum = Math.min(31, Math.max(1, parseInt(dueDay, 10) || 1));
    const curMonth = getTodayStr().slice(0, 7);
    const matchedAccount = accounts.find((a) => String(a.id) === String(accountId));

    onSave({
      id: initialData?.id || Date.now(),
      name: name.trim().toUpperCase(),
      amount: positive,
      dueDay: dayNum,
      dueDate: `${curMonth}-${String(dayNum).padStart(2, "0")}`,
      category: category || "Bill",
      accountId: matchedAccount ? matchedAccount.id : accountId,
      paidMonths: initialData?.paidMonths || {},
      archived: false,
      source: initialData?.source || "Manual Bill",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bill-modal-title"
        className="bg-white rounded-[26px] max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <h3 id="bill-modal-title" className="text-xl font-black text-slate-900">
            {initialData ? "Edit Bill / Loan" : "Add Recurring Bill / Loan"}
          </h3>
          <button
            type="button"
            aria-label="Close bill modal"
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
            <label htmlFor="bill-name-input" className="text-xs font-bold text-slate-700 block mb-1">
              Bill / Vendor Name
            </label>
            <input
              id="bill-name-input"
              type="text"
              placeholder="e.g. PROGRESSIVE INS, SPOTIFY, Car Loan"
              value={name}
              onChange={(e) => {
                setErrorMsg("");
                setName(e.target.value);
              }}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 placeholder:text-slate-400 font-bold uppercase focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
          </div>

          <div>
            <label htmlFor="bill-amount-input" className="text-xs font-bold text-slate-700 block mb-1">
              Monthly Amount ($)
            </label>
            <input
              id="bill-amount-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setErrorMsg("");
                setAmount(e.target.value);
              }}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 placeholder:text-slate-400 font-black focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="bill-dueday-input" className="text-xs font-bold text-slate-700 block mb-1">
                Due Day of Month (1-31)
              </label>
              <input
                id="bill-dueday-input"
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
              />
            </div>

            <div>
              <label htmlFor="bill-account-select" className="text-xs font-bold text-slate-700 block mb-1">
                Tied Account
              </label>
              <select
                id="bill-account-select"
                value={String(accountId)}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={String(a.id)} className="bg-white text-slate-950">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="bill-category-select" className="text-xs font-bold text-slate-700 block mb-1">
              Category
            </label>
            <select
              id="bill-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            >
              <option value="Insurance" className="bg-white text-slate-950">Insurance</option>
              <option value="Utilities" className="bg-white text-slate-950">Utilities</option>
              <option value="Rent" className="bg-white text-slate-950">Rent</option>
              <option value="Subscriptions" className="bg-white text-slate-950">Subscriptions</option>
              <option value="Loan" className="bg-white text-slate-950">Loan / Car Loan</option>
              <option value="Recurring Bill" className="bg-white text-slate-950">Recurring Bill</option>
              <option value="Other Spending" className="bg-white text-slate-950">Other</option>
            </select>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-sm text-sm"
          >
            {initialData ? "Save Changes" : "Save Bill"}
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
