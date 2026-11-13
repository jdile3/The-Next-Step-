import React from "react";
import { cleanMerchantName } from "../../utils/money";

interface ReceiptCategorySelectorProps {
  category: string;
  categories: string[];
  merchant: string;
  alwaysCategorize: boolean;
  onSelectCategory: (category: string) => void;
  onToggleAlwaysCategorize: (checked: boolean) => void;
}

export const ReceiptCategorySelector: React.FC<ReceiptCategorySelectorProps> = ({
  category,
  categories,
  merchant,
  alwaysCategorize,
  onSelectCategory,
  onToggleAlwaysCategorize,
}) => {
  return (
    <div className="space-y-2.5 pt-1">
      <div className="space-y-1.5">
        <div>
          <label htmlFor="receipt-category-input" className="block text-xs font-bold text-slate-700 mb-1">
            Category
          </label>
          <input
            id="receipt-category-input"
            type="text"
            value={category}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 p-2 text-sm bg-white font-bold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 [color-scheme:light]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1 max-h-20 overflow-y-auto">
          {categories.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSelectCategory(chip)}
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

      {merchant.trim() && (
        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={alwaysCategorize}
            onChange={(e) => onToggleAlwaysCategorize(e.target.checked)}
            className="w-4 h-4 text-cyan-600 rounded border-slate-300 mt-0.5"
          />
          <span className="text-xs text-slate-700 font-semibold leading-relaxed">
            Always list <b>"{cleanMerchantName(merchant) || merchant}"</b> under{" "}
            <b>"{category}"</b>
          </span>
        </label>
      )}
    </div>
  );
};
