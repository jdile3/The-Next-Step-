import React from "react";
import { ArrowLeft, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Account, Bill } from "../../types";
import { formatMoney } from "../../utils/money";

interface BillsSubPageProps {
  bills: Bill[];
  accounts: Account[];
  curMonthKey: string;
  onBack: () => void;
  onOpenAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onToggleBillPaid: (billId: number | string) => void;
  onDeleteBill: (billId: number | string) => void;
}

export const BillsSubPage: React.FC<BillsSubPageProps> = ({
  bills,
  accounts,
  curMonthKey,
  onBack,
  onOpenAddBill,
  onEditBill,
  onToggleBillPaid,
  onDeleteBill,
}) => {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-cyan-800 hover:text-cyan-950 shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to More</span>
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Bills & Loans</h2>
        <button
          type="button"
          onClick={onOpenAddBill}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Bill</span>
        </button>
      </div>

      <div className="space-y-2">
        {bills.map((b) => {
          const isPaid = Boolean(b.paidMonths?.[curMonthKey]);
          const acc = accounts.find((a) => String(a.id) === String(b.accountId));
          return (
            <div
              key={b.id}
              className={`flex items-center justify-between gap-2 p-4 rounded-2xl bg-white border shadow-xs ${
                isPaid ? "border-emerald-300 bg-emerald-50/40" : "border-[#cbd5e1]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleBillPaid(b.id)}
                  className={`flex items-center justify-center w-7 h-7 rounded-xl shrink-0 transition cursor-pointer ${
                    isPaid ? "bg-emerald-600 text-white" : "border-2 border-slate-300 bg-white"
                  }`}
                  title={isPaid ? "Mark unpaid" : "Mark paid"}
                  aria-label={isPaid ? `Mark ${b.name} unpaid` : `Mark ${b.name} paid`}
                >
                  {isPaid && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="min-w-0">
                  <b
                    className={`block truncate text-base font-black ${
                      isPaid ? "line-through text-slate-500" : "text-slate-900"
                    }`}
                  >
                    {b.name}
                  </b>
                  <span className="block text-xs text-slate-500">
                    Due day {b.dueDay} of month · {acc?.name || "Checking"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <b className="mr-1 text-base font-black text-slate-900">{formatMoney(b.amount)}</b>
                <button
                  type="button"
                  onClick={() => onEditBill(b)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  title="Edit bill"
                  aria-label={`Edit ${b.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteBill(b.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  title="Delete bill"
                  aria-label={`Delete ${b.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {bills.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No recurring bills recorded yet. Tap <strong>Add Bill</strong> to create one.
          </div>
        )}
      </div>
    </div>
  );
};
