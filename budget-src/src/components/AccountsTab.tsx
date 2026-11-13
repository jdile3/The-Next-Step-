import React, { useState } from "react";
import { Plus, Trash2, FileSpreadsheet, Lock } from "lucide-react";
import { Account, AccountType, AppData } from "../types";
import { formatMoney } from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";
import { AdBanner } from "./AdBanner";
import { AccountFormModal } from "./AccountFormModal";

interface AccountsTabProps {
  data: AppData;
  onStartCsv: (account: Account) => void;
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  onUpgradeClick?: () => void;
  isPaywallActive?: boolean;
  isPro?: boolean;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  data,
  onStartCsv,
  onSaveAccount,
  onDeleteAccount,
  onUpgradeClick,
  isPaywallActive = false,
  isPro = false,
}) => {
  const [accountDraft, setAccountDraft] = useState<Account | null>(null);
  const activeAccounts = data.accounts.filter((a) => !a.archived);
  const todayStr = getTodayStr();

  const getAccountBalance = (account: Account) => {
    const start = Number(account.statementBalance || 0);
    const txSum = data.transactions
      .filter(
        (tx) =>
          String(tx.accountId) === String(account.id) &&
          tx.date >= account.balanceDate &&
          tx.date <= todayStr
      )
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    return start + txSum;
  };

  const getCardStyle = (type: AccountType) => {
    switch (type) {
      case "Savings":
        return "from-[#1e1808] via-[#131826] to-[#0a0f1c] border-amber-400/35 shadow-[0_18px_45px_rgba(251,191,36,0.12)]";
      case "Cash":
        return "from-[#06242c] via-[#091829] to-[#050d18] border-cyan-400/35 shadow-[0_18px_45px_rgba(34,211,238,0.12)]";
      case "Credit Card":
      case "Loan":
        return "from-[#240b1c] via-[#131126] to-[#070b14] border-rose-400/35 shadow-[0_18px_45px_rgba(244,63,94,0.12)]";
      default:
        return "from-[#072622] via-[#09192b] to-[#050c17] border-emerald-400/35 shadow-[0_18px_45px_rgba(16,185,129,0.12)]";
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 w-full animate-tab-enter">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-400 block">
            LIQUID VAULT
          </span>
          <h2 className="text-2xl font-black text-white">Accounts & Cards</h2>
        </div>
        <button
          onClick={() => {
            if (isPaywallActive && activeAccounts.length >= 2) {
              onUpgradeClick?.();
              return;
            }
            setAccountDraft({
              id: Date.now(),
              name: "",
              type: "Checking",
              statementBalance: 0,
              balanceDate: todayStr,
            });
          }}
          className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>
            {isPaywallActive && activeAccounts.length >= 2 ? "Unlock Unlimited" : "Add Account"}
          </span>
        </button>
      </div>

      {/* Sculpted Metallic Bank Cards Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {activeAccounts.map((account) => {
          const bal = getAccountBalance(account);
          return (
            <div
              key={account.id}
              className={`relative bg-gradient-to-br ${getCardStyle(
                account.type
              )} border rounded-[2rem] p-5 text-white flex flex-col justify-between gap-5 overflow-hidden`}
            >
              {/* Subtle metallic sheen orb */}
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {/* Sculpted Metallic EMV Card Chip */}
                  <div className="w-10 h-7 rounded-lg bg-gradient-to-tr from-amber-500/80 via-yellow-200/90 to-amber-400/80 border border-amber-200/60 shadow-inner flex items-center justify-center shrink-0">
                    <div className="w-6 h-4 border border-amber-900/40 rounded-xs" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">{account.name}</h3>
                    <span className="text-[0.68rem] uppercase tracking-widest font-extrabold text-cyan-300/90">
                      {account.type}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteAccount(account)}
                  aria-label={`Delete account ${account.name}`}
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-rose-500/25 text-slate-300 hover:text-rose-300 flex items-center justify-center transition cursor-pointer"
                  title={`Delete account "${account.name}"`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10">
                <span className="text-[0.65rem] uppercase tracking-widest font-bold text-slate-400 block">
                  Live Vault Balance
                </span>
                <div className="text-3xl font-black text-white mt-0.5 tabular-nums tracking-tight">
                  {formatMoney(bal)}
                </div>
                <small className="text-xs text-slate-400 block mt-1">
                  Anchor balance: {formatMoney(account.statementBalance)} as of {account.balanceDate}
                </small>
              </div>

              <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => onStartCsv(account)}
                  className="flex-1 bg-white/12 hover:bg-white/20 border border-cyan-400/35 text-cyan-200 font-black text-xs py-2.5 px-4 rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
                  <span>CSV Time-Machine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountDraft({ ...account })}
                  className="bg-white/8 hover:bg-white/15 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-full transition cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Free Tier Account Limit Notice */}
      {isPaywallActive && activeAccounts.length >= 2 && !isPro && (
        <div className="bg-amber-950/60 border border-amber-400/40 rounded-full px-5 py-3.5 flex items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-3 min-w-0">
            <Lock className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="truncate">
              <b className="text-amber-200 block font-black">Free Tier: 2 Accounts Max</b>
              <span className="text-amber-300/80 block truncate">
                Unlock Lifetime Pro ($6.99 once) for unlimited accounts & cards.
              </span>
            </div>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-full shrink-0 cursor-pointer shadow-md"
            >
              Unlock
            </button>
          )}
        </div>
      )}

      {!isPro && onUpgradeClick && (
        <AdBanner onUpgradeClick={onUpgradeClick} isPro={isPro} className="mt-auto" />
      )}

      <AccountFormModal
        accountDraft={accountDraft}
        isEditing={Boolean(accountDraft && activeAccounts.some((a) => String(a.id) === String(accountDraft.id)))}
        onChangeDraft={setAccountDraft}
        onSave={(saved) => {
          onSaveAccount(saved);
          setAccountDraft(null);
        }}
        onClose={() => setAccountDraft(null)}
      />
    </div>
  );
};
