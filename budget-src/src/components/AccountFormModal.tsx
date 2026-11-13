import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Account, AccountType } from "../types";

interface AccountFormModalProps {
  accountDraft: Account | null;
  isEditing: boolean;
  onChangeDraft: (next: Account) => void;
  onSave: (account: Account) => void;
  onClose: () => void;
}

const DARK_FIELD_CLS =
  "w-full rounded-2xl border-2 border-slate-700 p-3 text-sm bg-[#040a14] text-white placeholder:text-slate-400 font-bold focus:outline-none focus:border-cyan-400 [color-scheme:dark]";

export const AccountFormModal: React.FC<AccountFormModalProps> = ({
  accountDraft,
  isEditing,
  onChangeDraft,
  onSave,
  onClose,
}) => {
  const [formError, setFormError] = useState("");
  const [balanceInput, setBalanceInput] = useState<string | null>(null);

  if (!accountDraft) return null;

  const displayedBalance =
    balanceInput !== null
      ? balanceInput
      : accountDraft.statementBalance === 0 && !isEditing
      ? ""
      : String(accountDraft.statementBalance);

  const handleSave = () => {
    if (!accountDraft.name.trim()) {
      setFormError("Please enter an account name.");
      return;
    }
    const parsedBal = balanceInput !== null ? Number(balanceInput) || 0 : Number(accountDraft.statementBalance) || 0;
    setFormError("");
    setBalanceInput(null);
    onSave({ ...accountDraft, name: accountDraft.name.trim(), statementBalance: parsedBal });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="bg-[#091526] rounded-[2rem] max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-cyan-400/30 text-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0">
          <h3 id="account-modal-title" className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>{isEditing ? "Edit Account" : "New Vault Account"}</span>
          </h3>
          <button
            type="button"
            aria-label="Close account modal"
            onClick={() => {
              setFormError("");
              setBalanceInput(null);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div role="alert" className="bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold p-3 rounded-2xl">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="account-name-input" className="text-xs font-bold text-slate-200 block mb-1.5">
              Account Name
            </label>
            <input
              id="account-name-input"
              type="text"
              value={accountDraft.name}
              onChange={(e) => {
                setFormError("");
                onChangeDraft({ ...accountDraft, name: e.target.value });
              }}
              placeholder="e.g. Primary Checking, Vault Savings, Cash App"
              className={DARK_FIELD_CLS}
            />
          </div>

          <div>
            <label htmlFor="account-type-select" className="text-xs font-bold text-slate-200 block mb-1.5">
              Account Type
            </label>
            <select
              id="account-type-select"
              value={accountDraft.type}
              onChange={(e) => onChangeDraft({ ...accountDraft, type: e.target.value as AccountType })}
              className={DARK_FIELD_CLS}
            >
              {(["Checking", "Savings", "Cash", "Credit Card", "Loan"] as AccountType[]).map((t) => (
                <option key={t} value={t} className="bg-[#091526] text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="account-balance-input" className="text-xs font-bold text-slate-200 block mb-1.5">
              Current / Starting Balance ($)
            </label>
            <input
              id="account-balance-input"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={displayedBalance}
              onChange={(e) => {
                setBalanceInput(e.target.value);
                onChangeDraft({ ...accountDraft, statementBalance: Number(e.target.value) || 0 });
              }}
              className={DARK_FIELD_CLS}
            />
          </div>

          <div>
            <label htmlFor="account-date-input" className="text-xs font-bold text-slate-200 block mb-1.5">
              Balance Anchor Date
            </label>
            <input
              id="account-date-input"
              type="date"
              value={accountDraft.balanceDate}
              onChange={(e) => onChangeDraft({ ...accountDraft, balanceDate: e.target.value })}
              className={DARK_FIELD_CLS}
            />
          </div>
        </div>

        <div className="flex gap-2.5 px-6 py-4 border-t border-white/10 bg-slate-950/80 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black py-3 rounded-full cursor-pointer shadow-lg text-sm"
          >
            Save Account
          </button>
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setBalanceInput(null);
              onClose();
            }}
            className="bg-white/10 hover:bg-white/20 text-slate-200 font-bold px-5 py-3 rounded-full cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
