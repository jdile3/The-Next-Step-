import React, { useState } from "react";
import { X, FileSpreadsheet, RefreshCw, Shuffle, CheckCircle2, Sparkles } from "lucide-react";
import { Account, Bill, CsvCustomColumn, DetectedBill, Transaction } from "../types";
import {
  autoCategorizeMerchant,
  cleanMerchantName,
  formatMoney,
  merchantRuleKey,
  normalizeDate,
  normalizeMerchant,
  parseMoney,
  splitCsvLine,
} from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";

interface CsvMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawLines: string[];
  delimiter: string;
  headers: string[];
  account: Account;
  fileName: string;
  existingTransactions: Transaction[];
  merchantRules?: Record<string, string>;
  onImportSuccess: (newTxs: Transaction[], newBills: Bill[], message: string) => void;
}

export const CsvMachineModal: React.FC<CsvMachineModalProps> = ({
  isOpen,
  onClose,
  rawLines,
  delimiter,
  headers,
  account,
  fileName,
  existingTransactions,
  merchantRules = {},
  onImportSuccess,
}) => {
  const [step, setStep] = useState<"mapping" | "custom_columns" | "bills_detected">("mapping");
  const [sampleOffset, setSampleOffset] = useState(0);

  // Auto-detect initial column indexes
  const initialDateCol = headers.findIndex((h) => /date|posted|time/i.test(h));
  const initialDescCol = headers.findIndex((h) => /desc|vendor|merchant|payee|name|memo/i.test(h));
  const initialAmountCol = headers.findIndex((h) => /amount|total|debit|net/i.test(h));
  const initialDebitCol = headers.findIndex((h) => /debit|withdrawal|out/i.test(h));
  const initialCreditCol = headers.findIndex((h) => /credit|deposit|in/i.test(h));

  const [dateCol, setDateCol] = useState(initialDateCol >= 0 ? initialDateCol : 0);
  const [descCol, setDescCol] = useState(initialDescCol >= 0 ? initialDescCol : 1);
  const [amountCol, setAmountCol] = useState(initialAmountCol >= 0 ? initialAmountCol : 2);
  const [amountMode, setAmountMode] = useState<"auto" | "expenses" | "income" | "standard">("auto");
  const [cleanVendorNames, setCleanVendorNames] = useState(true);

  // Custom columns
  const [customCols, setCustomCols] = useState<CsvCustomColumn[]>(() => {
    return headers
      .map((h, i) => ({
        colIndex: i,
        header: h || `Column ${i + 1}`,
        include: false,
        ledgerName: h || `Column ${i + 1}`,
      }))
      .filter((c) => ![initialDateCol, initialDescCol, initialAmountCol].includes(c.colIndex));
  });

  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedBills, setDetectedBills] = useState<DetectedBill[]>([]);
  const [approvedBills, setApprovedBills] = useState<Record<string, boolean>>({});
  const [skippedFailedCount, setSkippedFailedCount] = useState(0);
  const [skippedDupesCount, setSkippedDupesCount] = useState(0);
  const [autoCategorizedCount, setAutoCategorizedCount] = useState(0);
  const [cleanedNamesCount, setCleanedNamesCount] = useState(0);

  if (!isOpen) return null;

  const getColSamples = (colIdx: number) => {
    if (colIdx < 0) return [];
    const nonEmpties = rawLines
      .map((line) => splitCsvLine(line, delimiter)[colIdx])
      .filter((val) => val && val.trim());
    if (!nonEmpties.length) return ["(empty column)"];
    const start = sampleOffset % nonEmpties.length;
    const samples = nonEmpties.slice(start, start + 3);
    if (samples.length < 3) {
      samples.push(...nonEmpties.slice(0, 3 - samples.length));
    }
    return samples;
  };

  const confirmCoreMapping = () => {
    const parsed: any[] = [];
    let skippedFailed = 0;
    let skippedDuplicates = 0;
    let autoCatHits = 0;
    let cleanedHits = 0;
    const existingKeys = new Set(existingTransactions.map((tx) => tx.key));
    const seenImportKeys = new Set<string>();

    rawLines.forEach((line) => {
      const rowUpper = line.toUpperCase();
      // Notice and disregard failed transactions
      const isFailed = /FAILED|CANCELLED|CANCELED|DECLINED|VOID|REVERSED|EXPIRED|UNSUCCESSFUL|RETURNED/i.test(rowUpper);
      if (isFailed) {
        skippedFailed += 1;
        return;
      }

      const cells = splitCsvLine(line, delimiter);
      const date = normalizeDate(cells[dateCol]);
      const rawDescription = String(cells[descCol] || "").trim();
      if (!date || !rawDescription) return;

      const cleanedDesc = cleanMerchantName(rawDescription);
      const description = cleanVendorNames ? (cleanedDesc || rawDescription) : rawDescription;
      if (cleanVendorNames && cleanedDesc && cleanedDesc !== rawDescription) {
        cleanedHits += 1;
      }

      const debit = initialDebitCol >= 0 ? Math.abs(parseMoney(cells[initialDebitCol])) : 0;
      const credit = initialCreditCol >= 0 ? Math.abs(parseMoney(cells[initialCreditCol])) : 0;
      let finalAmount = 0;

      if (debit > 0 && credit === 0) {
        finalAmount = -debit;
      } else if (credit > 0 && debit === 0) {
        finalAmount = credit;
      } else {
        const rawAmt = parseMoney(cells[amountCol]);
        if (amountMode === "expenses") {
          finalAmount = -Math.abs(rawAmt);
        } else if (amountMode === "income") {
          finalAmount = Math.abs(rawAmt);
        } else if (amountMode === "standard") {
          finalAmount = rawAmt;
        } else {
          // Smart auto-detect: purchase/pos/card words mean money spent
          const isDepositDesc = /PAYROLL|DIRECT DEP|DEPOSIT|REFUND|REIMBURSEMENT|CREDIT INTEREST|DIVIDEND|SALARY/i.test(rawDescription);
          if (rawAmt < 0) {
            finalAmount = rawAmt;
          } else if (rawAmt > 0 && isDepositDesc) {
            finalAmount = rawAmt;
          } else {
            finalAmount = -Math.abs(rawAmt);
          }
        }
      }

      if (finalAmount === 0) return;

      const txKey = `${date}|${finalAmount.toFixed(2)}|${normalizeMerchant(rawDescription)}|${account.id}`;

      // Notice and disregard duplicate entries
      if (existingKeys.has(txKey) || seenImportKeys.has(txKey)) {
        skippedDuplicates += 1;
        return;
      }
      seenImportKeys.add(txKey);

      const resolvedCategory = autoCategorizeMerchant(rawDescription, finalAmount, merchantRules);
      if (resolvedCategory !== "Other Spending" && resolvedCategory !== "Other Income") {
        autoCatHits += 1;
      }

      parsed.push({
        id: `csv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        key: txKey,
        date,
        description,
        amount: finalAmount,
        accountId: account.id,
        category: resolvedCategory,
        txType: finalAmount > 0 ? "Deposit" : "Purchase",
        source: "Imported",
        rawCells: cells,
      });
    });

    setParsedRows(parsed);
    setSkippedFailedCount(skippedFailed);
    setSkippedDupesCount(skippedDuplicates);
    setAutoCategorizedCount(autoCatHits);
    setCleanedNamesCount(cleanedHits);

    if (customCols.length > 0) {
      setStep("custom_columns");
    } else {
      runBillDetection(parsed);
    }
  };

  const runBillDetection = (rowsToAnalyze: any[]) => {
    // Bill detection: notice same amount to same vendor every month within 5-6 day window
    const expenses = rowsToAnalyze.filter((r) => r.amount < 0);
    const groups: Record<string, { date: string; amount: number; merchant: string }[]> = {};

    expenses.forEach((tx) => {
      const key = `${merchantRuleKey(tx.description)}|${Math.abs(tx.amount).toFixed(0)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        date: tx.date,
        amount: Math.abs(tx.amount),
        merchant: tx.description.toUpperCase().trim(),
      });
    });

    const candidateBills: DetectedBill[] = [];
    const approved: Record<string, boolean> = {};

    Object.values(groups).forEach((items) => {
      if (items.length >= 2) {
        const days = items.map((it) => parseInt(it.date.split("-")[2], 10));
        const minDay = Math.min(...days);
        const maxDay = Math.max(...days);
        const diff = maxDay - minDay;

        if (diff <= 6) {
          const avgDay = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
          const avgAmt = items.reduce((a, b) => a + b.amount, 0) / items.length;
          const candidateName = items[0].merchant;

          candidateBills.push({
            merchant: candidateName,
            averageAmount: avgAmt,
            dueDay: avgDay,
            reason: `Recurring ${formatMoney(avgAmt)} detected within ${diff} day period`,
          });
          approved[candidateName] = true;
        }
      }
    });

    setDetectedBills(candidateBills);
    setApprovedBills(approved);
    setStep("bills_detected");
  };

  const finalizeImport = () => {
    const activeCustom = customCols.filter((c) => c.include);
    const enrichedRows: Transaction[] = parsedRows.map((row) => {
      const extraMeta: Record<string, string> = {};
      activeCustom.forEach((c) => {
        extraMeta[c.ledgerName] = row.rawCells?.[c.colIndex] || "";
      });
      return {
        id: row.id,
        key: row.key,
        date: row.date,
        description: row.description,
        amount: row.amount,
        accountId: row.accountId,
        category: row.category,
        txType: row.txType,
        source: row.source,
        extraMeta: Object.keys(extraMeta).length ? extraMeta : undefined,
      };
    });

    const newBills: Bill[] = detectedBills
      .filter((b) => approvedBills[b.merchant])
      .map((b) => ({
        id: Date.now() + Math.random(),
        name: b.merchant,
        amount: Number(b.averageAmount.toFixed(2)),
        dueDay: b.dueDay,
        dueDate: `${getTodayStr().slice(0, 7)}-${String(b.dueDay).padStart(2, "0")}`,
        category: autoCategorizeMerchant(b.merchant, -b.averageAmount, merchantRules) || "Recurring Bill",
        accountId: account.id,
        paidMonths: {},
        archived: false,
        source: "CSV Machine",
      }));

    let notice = `CSV Machine imported ${enrichedRows.length} transactions into ${account.name}`;
    if (autoCategorizedCount > 0) {
      notice += ` (${autoCategorizedCount} auto-categorized)`;
    }
    if (newBills.length) notice += ` and added ${newBills.length} recurring bills to your Calendar.`;
    if (skippedFailedCount > 0 || skippedDupesCount > 0) {
      notice += ` (Filtered out ${skippedFailedCount} failed & ${skippedDupesCount} duplicates).`;
    }

    onImportSuccess(enrichedRows, newBills, notice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[26px] max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-600" />
              <span>CSV File Machine</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {fileName} → {account.name}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close CSV File Machine"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* STEP 1: MAPPING */}
          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 p-3.5 rounded-2xl text-xs text-slate-700">
                <div>
                  <b className="text-cyan-900 block font-bold text-sm">Step 1: Confirm Primary Columns</b>
                  <p className="mt-0.5">Verify which column matches Date, Description, and Amount.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSampleOffset((prev) => prev + 3)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  title="Cycle through different rows from this CSV"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Next 3 Samples</span>
                </button>
              </div>

              {/* Date Column */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900">1. Date Column</label>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Detected
                  </span>
                </div>
                <select
                  aria-label="Date column"
                  value={dateCol}
                  onChange={(e) => setDateCol(Number(e.target.value))}
                  className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i} className="bg-white text-slate-950">
                      Column {i + 1}: {h || `Column ${i + 1}`}
                    </option>
                  ))}
                </select>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                    <span>3 examples from this column:</span>
                    <button
                      type="button"
                      onClick={() => setSampleOffset((prev) => prev + 3)}
                      className="text-cyan-700 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Try 3 different samples</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-slate-800">
                    {getColSamples(dateCol).map((val, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-0.5 rounded border">
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Column */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900">2. Vendor / Description Column</label>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Detected
                  </span>
                </div>
                <select
                  aria-label="Vendor or description column"
                  value={descCol}
                  onChange={(e) => setDescCol(Number(e.target.value))}
                  className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i} className="bg-white text-slate-950">
                      Column {i + 1}: {h || `Column ${i + 1}`}
                    </option>
                  ))}
                </select>

                {/* Smart Merchant Cleaner Toggle (Cash App / Bank IDs) */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cleanVendorNames}
                    onChange={(e) => setCleanVendorNames(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-0.5"
                  />
                  <div className="text-xs text-slate-800">
                    <b className="font-bold text-emerald-950 block">
                      Auto-Clean Messy Bank & Cash App Names (Recommended)
                    </b>
                    <span className="text-slate-600">
                      Strips store numbers (#1234), transaction IDs, and "CASH APP*" / "POS DEBIT" prefixes so identical merchants group and categorize automatically.
                    </span>
                  </div>
                </label>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                    <span>3 examples from this column:</span>
                    <button
                      type="button"
                      onClick={() => setSampleOffset((prev) => prev + 3)}
                      className="text-cyan-700 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Try 3 different samples</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-slate-800">
                    {getColSamples(descCol).map((val, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-0.5 rounded border">
                        {cleanVendorNames ? cleanMerchantName(val) || val : val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount Column */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900">3. Transaction Amount Column</label>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Detected
                  </span>
                </div>
                <select
                  aria-label="Transaction amount column"
                  value={amountCol}
                  onChange={(e) => setAmountCol(Number(e.target.value))}
                  className="w-full rounded-xl border-2 border-slate-300 p-2.5 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
                >
                  {headers.map((h, i) => (
                    <option key={i} value={i} className="bg-white text-slate-950">
                      Column {i + 1}: {h || `Column ${i + 1}`}
                    </option>
                  ))}
                </select>
                <div className="pt-1">
                  <label htmlFor="csv-amount-mode" className="text-xs font-bold text-slate-700 block mb-1">
                    How are amounts written?
                  </label>
                  <select
                    id="csv-amount-mode"
                    value={amountMode}
                    onChange={(e) => setAmountMode(e.target.value as "auto" | "expenses" | "income" | "standard")}
                    className="w-full rounded-xl border-2 border-slate-300 p-2 text-xs bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
                  >
                    <option value="auto" className="bg-white text-slate-950">⚡ Smart Auto-Detect (Identifies purchases/withdrawals as expenses)</option>
                    <option value="expenses" className="bg-white text-slate-950">🔻 All Numbers are Expenses (Spending / Money Out)</option>
                    <option value="income" className="bg-white text-slate-950">🔺 All Numbers are Income (Deposits / Money In)</option>
                    <option value="standard" className="bg-white text-slate-950">⚖️ Standard (+ is Deposit, - is Expense)</option>
                  </select>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                    <span>3 examples from this column:</span>
                    <button
                      type="button"
                      onClick={() => setSampleOffset((prev) => prev + 3)}
                      className="text-cyan-700 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Try 3 different samples</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-slate-800">
                    {getColSamples(amountCol).map((val, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-0.5 rounded border font-bold">
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOM COLUMNS */}
          {step === "custom_columns" && (
            <div className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 p-3.5 rounded-2xl text-xs text-slate-700">
                <b className="text-cyan-900 block font-bold text-sm">Step 2: Custom Columns Control</b>
                <p className="mt-0.5">
                  Your file has extra columns. Would you like to include any in your ledger? Check the box and name what the app calls that column:
                </p>
              </div>

              <div className="space-y-3">
                {customCols.map((col, idx) => (
                  <div key={col.colIndex} className="p-3.5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.include}
                          onChange={(e) => {
                            const updated = [...customCols];
                            updated[idx].include = e.target.checked;
                            setCustomCols(updated);
                          }}
                          className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                        />
                        <span className="text-sm font-bold text-slate-900">Include "{col.header}"?</span>
                      </label>
                      <span className="text-xs text-slate-400 font-mono">Column #{col.colIndex + 1}</span>
                    </div>

                    {col.include && (
                      <div className="pt-2">
                        <label className="text-xs text-slate-600 block mb-1">
                          What should the app call this column in your ledger?
                        </label>
                        <input
                          type="text"
                          value={col.ledgerName}
                          onChange={(e) => {
                            const updated = [...customCols];
                            updated[idx].ledgerName = e.target.value;
                            setCustomCols(updated);
                          }}
                          className="w-full rounded-xl border-2 border-slate-300 p-2 text-sm bg-white text-slate-950 font-bold focus:outline-none focus:border-cyan-600 [color-scheme:light]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: BILLS DETECTED & CLEAN STATEMENT SUMMARY */}
          {step === "bills_detected" && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Statement Cleaned & Auto-Categorized</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                  <li>
                    Ready to import <b>{parsedRows.length}</b> valid transactions into <b>{account.name}</b>.
                  </li>
                  {cleanedNamesCount > 0 && (
                    <li>
                      Cleaned transaction IDs & store numbers from <b>{cleanedNamesCount}</b> messy vendor names.
                    </li>
                  )}
                  {autoCategorizedCount > 0 && (
                    <li>
                      Automatically categorized <b>{autoCategorizedCount}</b> transactions using your rules & smart merchant recognition.
                    </li>
                  )}
                  {(skippedFailedCount > 0 || skippedDupesCount > 0) && (
                    <li>
                      Filtered out <b>{skippedFailedCount}</b> failed/cancelled rows and <b>{skippedDupesCount}</b> duplicates.
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-lime-50 border border-lime-300 p-4 rounded-2xl text-xs text-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-lime-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Smart Bill Detection</span>
                </div>
                <p>
                  The machine analyzed your statement for recurring payments (repeating vendor amounts within the same 5-6 day period every month).
                </p>
              </div>

              {detectedBills.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900">
                    Found {detectedBills.length} Bill Candidate(s):
                  </h4>
                  {detectedBills.map((bill) => (
                    <div key={bill.merchant} className="p-4 border border-cyan-200 bg-cyan-50/70 rounded-2xl space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <b className="text-base font-black text-slate-900 block">{bill.merchant}</b>
                          <span className="text-xs text-slate-600">
                            Due around day {bill.dueDay} of month · {bill.reason}
                          </span>
                        </div>
                        <b className="text-base font-black text-slate-900">{formatMoney(bill.averageAmount)}</b>
                      </div>

                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={approvedBills[bill.merchant] ?? true}
                          onChange={(e) => {
                            setApprovedBills({
                              ...approvedBills,
                              [bill.merchant]: e.target.checked,
                            });
                          }}
                          className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          Save as monthly bill & add to Calendar (Due Day {bill.dueDay})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-slate-50 border rounded-2xl text-center text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">No recurring monthly bills detected in this file.</p>
                  <p>You can always add bills manually in Calendar or More → Bills anytime.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
          {step === "mapping" && (
            <button
              onClick={confirmCoreMapping}
              className="w-full bg-[#061629] hover:bg-[#0c2440] text-white font-black py-3 rounded-xl transition cursor-pointer shadow-md text-sm"
            >
              Confirm Columns & Continue →
            </button>
          )}
          {step === "custom_columns" && (
            <button
              onClick={() => runBillDetection(parsedRows)}
              className="w-full bg-[#061629] hover:bg-[#0c2440] text-white font-black py-3 rounded-xl transition cursor-pointer shadow-md text-sm"
            >
              Save Preferences & Detect Recurring Bills →
            </button>
          )}
          {step === "bills_detected" && (
            <button
              onClick={finalizeImport}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black py-3 rounded-xl transition cursor-pointer shadow-md text-base"
            >
              Import {parsedRows.length} Transactions to Ledger ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
