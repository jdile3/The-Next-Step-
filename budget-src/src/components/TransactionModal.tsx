import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { Account, Transaction } from "../types";
import { autoCategorizeMerchant, cleanMerchantName, parseMoney } from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: string[];
  merchantRules?: Record<string, string>;
  initialData?: Transaction | null;
  onSave: (tx: Partial<Transaction>, alwaysCategorize: boolean) => void;
  onDelete?: (id: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  merchantRules = {},
  initialData,
  onSave,
  onDelete,
}) => {
  const isEditing = !!initialData;

  const [direction, setDirection] = useState<"out" | "in">("out");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayStr());
  const [accountId, setAccountId] = useState<number | string>(accounts[0]?.id || 1);
  const [category, setCategory] = useState("Other Spending");
  const [userPickedCategory, setUserPickedCategory] = useState(false);
  const [alwaysCategorize, setAlwaysCategorize] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const initDir = initialData ? (initialData.amount < 0 ? "out" : "in") : "out";
      setDirection(initDir);
      setDescription(initialData?.description || "");
      setAmount(initialData ? String(Math.abs(initialData.amount)) : "");
      setDate(initialData?.date || getTodayStr());
      setAccountId(initialData?.accountId ?? accounts[0]?.id ?? 1);
      setCategory(
        initialData?.category || (initDir === "in" ? "Other Income" : "Other Spending")
      );
      setUserPickedCategory(!!initialData);
      setAlwaysCategorize(false);
      setErrorMsg("");
    }
  }, [isOpen, initialData, accounts]);

  if (!isOpen) return null;

  const handleDescriptionChange = (val: string) => {
    setErrorMsg("");
    setDescription(val);
    if (!userPickedCategory && val.trim().length >= 2) {
      const signAmt = direction === "out" ? -10 : 10;
      const suggested = autoCategorizeMerchant(val, signAmt, merchantRules);
      if (suggested) {
        setCategory(suggested);
      }
    }
  };

  const handleSave = () => {
    const parsedAmount = parseMoney(amount);
    if (!parsedAmount || !description.trim()) {
      setErrorMsg("Please enter both a vendor description and a dollar amount.");
      return;
    }

    const finalAmount = direction === "out" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
    const catName = category.trim() || (finalAmount > 0 ? "Other Income" : "Other Spending");
    const matchedAccount = accounts.find((a) => String(a.id) === String(accountId));
    const cleanedDesc = cleanMerchantName(description.trim());

    onSave(
      {
        id: initialData?.id || `manual-${Date.now()}`,
        date,
        description: cleanedDesc || description.trim(),
        amount: finalAmount,
        accountId: matchedAccount ? matchedAccount.id : accountId,
        category: catName,
        txType: finalAmount > 0 ? "Deposit" : "Purchase",
        source: initialData?.source || "Manual",
      },
      alwaysCategorize
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-modal-title"
        className="bg-white rounded-[26px] max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <h3 id="tx-modal-title" className="text-xl font-black text-slate-900">
            {isEditing ? "Edit Transaction" : "Record Transaction"}
          </h3>
          <button
            type="button"
            aria-label="Close transaction modal"
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
            <label htmlFor="tx-direction-select" className="text-xs font-bold text-slate-700 block mb-1">
              Direction
            </label>
            <select
              id="tx-direction-select"
              value={direction}
              onChange={(e) => {
                const nextDir = e.target.value as "out" | "in";
                setDirection(nextDir);
                if (!userPickedCategory || category === "Other Income" || category === "Other Spending") {
                  setCategory(nextDir === "in" ? "Other Income" : "Other Spending");
                }
              }}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            >
              <option value="out" className="bg-white text-slate-950">Money Out (Spending / Debit)</option>
              <option value="in" className="bg-white text-slate-950">Money In (Income / Deposit)</option>
            </select>
          </div>

          <div>
            <label htmlFor="tx-description-input" className="text-xs font-bold text-slate-700 block mb-1">
              Vendor / Description
            </label>
            <input
              id="tx-description-input"
              type="text"
              placeholder="e.g. Walmart, DoorDash, Rent"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 placeholder:text-slate-400 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
          </div>

          <div>
            <label htmlFor="tx-amount-input" className="text-xs font-bold text-slate-700 block mb-1">
              Amount ($)
            </label>
            <input
              id="tx-amount-input"
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
              <label htmlFor="tx-date-input" className="text-xs font-bold text-slate-700 block mb-1">
                Date
              </label>
              <input
                id="tx-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
              />
            </div>

            <div>
              <label htmlFor="tx-account-select" className="text-xs font-bold text-slate-700 block mb-1">
                Account
              </label>
              <select
                id="tx-account-select"
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

          <div className="space-y-1.5 pt-1">
            <label htmlFor="tx-category-input" className="block text-xs font-bold text-slate-700">
              Category
            </label>
            <input
              id="tx-category-input"
              type="text"
              placeholder="e.g. Groceries, Casino, Dining Out"
              value={category}
              onChange={(e) => {
                setUserPickedCategory(true);
                setCategory(e.target.value);
              }}
              className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white font-bold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 [color-scheme:light]"
            />
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
              {categories.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setUserPickedCategory(true);
                    setCategory(chip);
                  }}
                  className={`text-[11px] px-2 py-1 rounded-lg border transition cursor-pointer ${
                    category === chip
                      ? "bg-cyan-500 text-slate-950 font-bold border-cyan-600"
                      : "bg-slate-100 hover:bg-cyan-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Always Categorize rule */}
          {description.trim() && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={alwaysCategorize}
                onChange={(e) => setAlwaysCategorize(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded border-slate-300 mt-0.5"
              />
              <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                Always list <b>"{cleanMerchantName(description) || description}"</b> under{" "}
                <b>"{category || "this category"}"</b> and update matching transactions in my ledger
              </span>
            </label>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition cursor-pointer shadow-sm text-sm"
          >
            {isEditing ? "Save Changes" : "Save Transaction"}
          </button>
          {isEditing && onDelete && initialData && (
            <button
              onClick={() => {
                onDelete(initialData.id);
                onClose();
              }}
              className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-1 text-sm"
              title="Delete transaction"
            >
              <Trash2 className="w-4 h-4 text-rose-700" />
              <span>Delete</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2.5 rounded-xl cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
