import React, { useState, useMemo } from "react";
import { Search, Filter, Camera, Plus, RefreshCw, X, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Account, AppData, PayPeriodInfo, Transaction } from "../types";
import { formatMoney } from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";

interface TransactionsTabProps {
  data: AppData;
  payPeriod: PayPeriodInfo;
  onOpenAddModal: () => void;
  onOpenReceiptScanner: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  data,
  payPeriod,
  onOpenAddModal,
  onOpenReceiptScanner,
  onEditTransaction,
}) => {
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateRange, setFilterDateRange] = useState<"all" | "pay_period" | "last_30" | "custom">("all");
  const [filterCustomStart, setFilterCustomStart] = useState("");
  const [filterCustomEnd, setFilterCustomEnd] = useState("");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDepositSpend, setFilterDepositSpend] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  const todayStr = getTodayStr();

  // Dynamic filter lists based on current data
  const uniqueAccountsInLedger = useMemo(() => {
    return Array.from(new Set(data.transactions.map((t) => t.accountId)));
  }, [data.transactions]);

  const uniqueCategoriesInLedger = useMemo(() => {
    return Array.from(new Set(data.transactions.map((t) => t.category).filter(Boolean)));
  }, [data.transactions]);

  const hasBothMoneyInAndOut = useMemo(() => {
    const hasIn = data.transactions.some((t) => t.amount > 0);
    const hasOut = data.transactions.some((t) => t.amount < 0);
    return hasIn && hasOut;
  }, [data.transactions]);

  const isAnyFilterActive =
    filterSearch.trim() !== "" ||
    filterDateRange !== "all" ||
    filterAccount !== "all" ||
    filterCategory !== "all" ||
    filterDepositSpend !== "all" ||
    filterSource !== "all";

  // Filtered transactions for the ledger
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((tx) => {
      if (filterSearch.trim()) {
        const query = filterSearch.toLowerCase();
        const descMatch = (tx.description || "").toLowerCase().includes(query);
        const catMatch = (tx.category || "").toLowerCase().includes(query);
        if (!descMatch && !catMatch) return false;
      }

      if (filterDateRange === "pay_period") {
        if (tx.date < payPeriod.startDate || tx.date > payPeriod.endDate) return false;
      } else if (filterDateRange === "last_30") {
        const d = new Date(todayStr);
        d.setDate(d.getDate() - 30);
        const thirtyDaysAgo = d.toISOString().slice(0, 10);
        if (tx.date < thirtyDaysAgo || tx.date > todayStr) return false;
      } else if (filterDateRange === "custom") {
        if (filterCustomStart && tx.date < filterCustomStart) return false;
        if (filterCustomEnd && tx.date > filterCustomEnd) return false;
      }

      if (filterAccount !== "all" && String(tx.accountId) !== String(filterAccount)) {
        return false;
      }

      if (filterCategory !== "all" && tx.category !== filterCategory) {
        return false;
      }

      if (filterDepositSpend === "spend" && tx.amount >= 0) return false;
      if (filterDepositSpend === "deposit" && tx.amount <= 0) return false;

      if (filterSource !== "all") {
        if (filterSource === "Manual" && tx.source !== "Manual") return false;
        if (filterSource === "Imported" && tx.source !== "Imported" && tx.source !== "Receipt Scan") return false;
      }

      return true;
    });
  }, [
    data.transactions,
    filterSearch,
    filterDateRange,
    filterCustomStart,
    filterCustomEnd,
    filterAccount,
    filterCategory,
    filterDepositSpend,
    filterSource,
    payPeriod,
    todayStr,
  ]);

  // Grand Total of filtered transactions
  const filteredGrandTotal = useMemo(() => {
    let totalSpend = 0;
    let totalIncome = 0;
    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (amt < 0) totalSpend += Math.abs(amt);
      else totalIncome += amt;
    });
    return {
      net: totalIncome - totalSpend,
      spend: totalSpend,
      income: totalIncome,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setFilterSearch("");
    setFilterDateRange("all");
    setFilterCustomStart("");
    setFilterCustomEnd("");
    setFilterAccount("all");
    setFilterCategory("all");
    setFilterDepositSpend("all");
    setFilterSource("all");
  };

  return (
    <div className="flex-1 flex flex-col gap-4 w-full animate-tab-enter">
      {/* Top Header Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-400 block">
            ACTIVITY STREAM
          </span>
          <h2 className="text-2xl font-black text-white">Transaction Ledger</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceiptScanner}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-black text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Scan or snap receipt"
          >
            <Camera className="w-4 h-4 text-emerald-300" />
            <span>Scan Receipt</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      {data.transactions.length > 0 && (
        <div className="bg-[#091526]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-xl space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search merchant or category..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full rounded-full border border-white/15 pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-400 bg-slate-950/70 focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          {/* Usable filters row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <select
              aria-label="Filter by date range"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as "all" | "pay_period" | "last_30" | "custom")}
              className="text-xs font-bold bg-slate-950 border border-white/15 rounded-full px-3 py-1.5 text-white [color-scheme:dark]"
            >
              <option value="all" className="bg-[#091526] text-white">All Dates</option>
              <option value="pay_period" className="bg-[#091526] text-white">Pay Period ({payPeriod.label})</option>
              <option value="last_30" className="bg-[#091526] text-white">Last 30 Days</option>
              <option value="custom" className="bg-[#091526] text-white">Custom Range...</option>
            </select>

            {/* Custom Dates if selected */}
            {filterDateRange === "custom" && (
              <div className="flex items-center gap-1.5 bg-slate-950 border border-white/15 rounded-full px-2.5 py-1 text-xs text-white [color-scheme:dark]">
                <input
                  type="date"
                  aria-label="Custom start date"
                  value={filterCustomStart}
                  onChange={(e) => setFilterCustomStart(e.target.value)}
                  className="bg-transparent text-xs p-0.5 text-white [color-scheme:dark]"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  aria-label="Custom end date"
                  value={filterCustomEnd}
                  onChange={(e) => setFilterCustomEnd(e.target.value)}
                  className="bg-transparent text-xs p-0.5 text-white [color-scheme:dark]"
                />
              </div>
            )}

            {/* Accounts Filter */}
            {uniqueAccountsInLedger.length > 1 && (
              <select
                aria-label="Filter by account"
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="text-xs font-bold bg-slate-950 border border-white/15 rounded-full px-3 py-1.5 text-white [color-scheme:dark]"
              >
                <option value="all" className="bg-[#091526] text-white">All Accounts</option>
                {uniqueAccountsInLedger.map((accId) => {
                  const acc = data.accounts.find((a) => String(a.id) === String(accId));
                  return (
                    <option key={String(accId)} value={String(accId)} className="bg-[#091526] text-white">
                      {acc ? acc.name : `Account #${accId}`}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Category Filter */}
            {uniqueCategoriesInLedger.length > 1 && (
              <select
                aria-label="Filter by category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs font-bold bg-slate-950 border border-white/15 rounded-full px-3 py-1.5 text-white [color-scheme:dark]"
              >
                <option value="all" className="bg-[#091526] text-white">All Categories</option>
                {uniqueCategoriesInLedger.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#091526] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Deposit / Spend Filter */}
            {hasBothMoneyInAndOut && (
              <select
                aria-label="Filter by inflow or outflow"
                value={filterDepositSpend}
                onChange={(e) => setFilterDepositSpend(e.target.value)}
                className="text-xs font-bold bg-slate-950 border border-white/15 rounded-full px-3 py-1.5 text-white [color-scheme:dark]"
              >
                <option value="all" className="bg-[#091526] text-white">Inflow & Outflow</option>
                <option value="spend" className="bg-[#091526] text-white">Spending Only</option>
                <option value="deposit" className="bg-[#091526] text-white">Deposits Only</option>
              </select>
            )}

            {/* Reset button */}
            {isAnyFilterActive && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-500/20 px-3 py-1.5 rounded-full border border-rose-400/35 cursor-pointer flex items-center gap-1 ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* FILTERED GRAND TOTAL BANNER */}
      {data.transactions.length > 0 && (
        <div className="bg-gradient-to-r from-[#0b1b32] via-[#081324] to-[#0b1b32] text-white p-4 px-5 rounded-[2rem] shadow-lg border border-cyan-400/25 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.68rem] font-black uppercase tracking-widest text-cyan-300">
                Net Cash Flow
              </span>
              <span className="text-[0.68rem] bg-white/10 text-slate-200 font-bold px-2.5 py-0.5 rounded-full">
                {filteredGrandTotal.count} {filteredGrandTotal.count === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-0.5 tabular-nums">
              {formatMoney(filteredGrandTotal.net)}
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-medium">
            <div className="flex items-center gap-1.5 bg-rose-500/15 px-3 py-1.5 rounded-full border border-rose-400/30">
              <ArrowDownLeft className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-rose-200/80 block text-[0.62rem] uppercase font-bold">Outflow</span>
                <b className="text-rose-300 font-black tabular-nums">{formatMoney(filteredGrandTotal.spend)}</b>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-400/30">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-emerald-200/80 block text-[0.62rem] uppercase font-bold">Inflow</span>
                <b className="text-emerald-300 font-black tabular-nums">{formatMoney(filteredGrandTotal.income)}</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION STREAM */}
      <div className="rounded-[2rem] bg-[#081426]/90 backdrop-blur-xl border border-white/10 divide-y divide-white/8 overflow-hidden shadow-xl flex-1">
        {filteredTransactions.map((tx) => {
          const account = data.accounts.find((a) => String(a.id) === String(tx.accountId));
          const isExpense = tx.amount < 0;
          return (
            <div
              key={tx.id}
              onClick={() => onEditTransaction(tx)}
              className="p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    isExpense
                      ? "bg-rose-500/15 border-rose-400/35 text-rose-300"
                      : "bg-emerald-500/15 border-emerald-400/35 text-emerald-300"
                  }`}
                >
                  {isExpense ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <b className="text-sm font-black text-white group-hover:text-cyan-300 transition block truncate">
                    {tx.description}
                  </b>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <span>{tx.date}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-300">{account?.name || "Account"}</span>
                    <span>·</span>
                    <span className="text-cyan-300 font-bold">{tx.category || "General"}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`text-base font-black tabular-nums ${
                    isExpense ? "text-white" : "text-emerald-300"
                  }`}
                >
                  {isExpense ? `-${formatMoney(Math.abs(tx.amount))}` : `+${formatMoney(tx.amount)}`}
                </div>
                <span className="text-[0.65rem] text-slate-500 uppercase font-bold block">
                  {tx.source || "Manual"}
                </span>
              </div>
            </div>
          );
        })}

        {!filteredTransactions.length && (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="font-black text-white text-base">Your Activity Stream Is Empty</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tap <strong className="text-cyan-300">+ Add</strong> or <strong className="text-emerald-300">Scan Receipt</strong> above to log spending or deposits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
