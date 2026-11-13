import React from "react";
import { X, ShieldCheck } from "lucide-react";
import { Account } from "../../types";
import { ReceiptReviewData, ReceiptScanStatus } from "../../hooks/useReceiptScanner";
import { ReceiptScanBanner } from "./ReceiptScanBanner";
import { ReceiptPhotoPreview } from "./ReceiptPhotoPreview";
import { ReceiptCategorySelector } from "./ReceiptCategorySelector";

interface ReceiptReviewStepProps {
  reviewData: ReceiptReviewData;
  accounts: Account[];
  categories: string[];
  scanStatus: ReceiptScanStatus;
  scanProgress: number;
  scanLabel: string;
  zoomedPhoto: boolean;
  formError: string;
  alwaysCategorize: boolean;
  onToggleZoom: () => void;
  onUpdateField: (field: "merchant" | "amount" | "date" | "accountId" | "category", value: string) => void;
  onToggleAlwaysCategorize: (checked: boolean) => void;
  onRetryScan: () => void;
  onSave: () => void;
  onRetake: () => void;
}

const FIELD_CLS =
  "w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 placeholder:text-slate-400 font-bold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 [color-scheme:light]";

export const ReceiptReviewStep: React.FC<ReceiptReviewStepProps> = ({
  reviewData, accounts, categories, scanStatus, scanProgress, scanLabel,
  zoomedPhoto, formError, alwaysCategorize, onToggleZoom, onUpdateField,
  onToggleAlwaysCategorize, onRetryScan, onSave, onRetake,
}) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="receipt-review-title"
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4"
  >
    <div className="bg-white rounded-[26px] max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 shrink-0">
        <div>
          <h3 id="receipt-review-title" className="text-lg font-black text-slate-900">
            Review & Edit Scanned Receipt
          </h3>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fields are editable • Photo deletes on save</span>
          </span>
        </div>
        <button
          type="button"
          aria-label="Discard photo and close"
          onClick={onRetake}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-3 overflow-y-auto flex-1">
        <ReceiptScanBanner status={scanStatus} progress={scanProgress} label={scanLabel} fieldsFound={reviewData.fieldsFound} onRetryScan={onRetryScan} />
        <ReceiptPhotoPreview photoUrl={reviewData.photoUrl} zoomedPhoto={zoomedPhoto} onToggleZoom={onToggleZoom} />
        {formError && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="receipt-vendor-input" className="text-xs font-bold text-slate-700 block mb-1">Vendor / Store</label>
            <input
              id="receipt-vendor-input"
              type="text"
              placeholder="e.g. Cub Foods, Walmart, Shell"
              value={reviewData.merchant}
              onChange={(e) => onUpdateField("merchant", e.target.value)}
              className={FIELD_CLS}
            />
          </div>
          <div>
            <label htmlFor="receipt-amount-input" className="text-xs font-bold text-slate-700 block mb-1">Receipt Total ($)</label>
            <input
              id="receipt-amount-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={reviewData.amount}
              onChange={(e) => onUpdateField("amount", e.target.value)}
              className={`${FIELD_CLS} font-black`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="receipt-date-input" className="text-xs font-bold text-slate-700 block mb-1">Date</label>
            <input
              id="receipt-date-input"
              type="date"
              value={reviewData.date}
              onChange={(e) => onUpdateField("date", e.target.value)}
              className={FIELD_CLS}
            />
          </div>
          <div>
            <label htmlFor="receipt-account-select" className="text-xs font-bold text-slate-700 block mb-1">Debit Account</label>
            <select
              id="receipt-account-select"
              value={String(reviewData.accountId)}
              onChange={(e) => onUpdateField("accountId", e.target.value)}
              className={FIELD_CLS}
            >
              {accounts.map((a) => (
                <option key={a.id} value={String(a.id)} className="bg-white text-slate-950">{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <ReceiptCategorySelector
          category={reviewData.category}
          categories={categories}
          merchant={reviewData.merchant}
          alwaysCategorize={alwaysCategorize}
          onSelectCategory={(cat) => onUpdateField("category", cat)}
          onToggleAlwaysCategorize={onToggleAlwaysCategorize}
        />
      </div>

      <div className="flex gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
        <button
          type="button"
          onClick={onSave}
          className="flex-1 bg-green-700 hover:bg-green-800 text-white font-black py-2.5 rounded-xl transition cursor-pointer shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Enter Transaction ✓
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Retake
        </button>
      </div>
    </div>
  </div>
);
