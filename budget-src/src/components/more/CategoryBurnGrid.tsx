import React, { useMemo } from "react";
import { Transaction } from "../../types";
import { formatMoney } from "../../utils/money";

interface CategoryBurnGridProps {
  transactions: Transaction[];
  hourlyRate: number;
}

export const CategoryBurnGrid: React.FC<CategoryBurnGridProps> = ({
  transactions,
  hourlyRate,
}) => {
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const tx of transactions) {
      const amt = Number(tx.amount);
      if (amt < 0) {
        const cat = tx.category || "Other Spending";
        totals[cat] = (totals[cat] || 0) + Math.abs(amt);
      }
    }
    return Object.entries(totals);
  }, [transactions]);

  return (
    <div className="space-y-2 pt-2">
      <b className="block text-sm font-black uppercase tracking-wider text-white">
        All Spending Categories
      </b>
      {categoryTotals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {categoryTotals.map(([cat, total]) => {
            const hours = hourlyRate > 0 ? (total / hourlyRate).toFixed(1) : null;
            return (
              <div
                key={cat}
                className="p-4 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs"
              >
                <span className="block truncate text-xs font-black uppercase text-slate-900">
                  {cat}
                </span>
                <b className="block mt-1 text-xl font-black text-slate-900">
                  {formatMoney(total)}
                </b>
                <span className="block mt-0.5 text-xs font-medium text-slate-500">
                  {hours ? `${hours} work hours` : "Set wage in Settings"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
          No expense transactions recorded yet.
        </div>
      )}
    </div>
  );
};
