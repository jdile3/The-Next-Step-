import { cleanMerchantName } from "./money";
import { KNOWN_VENDORS } from "./receiptVendors";

export interface ExtractedReceiptData {
  merchant: string;
  amount: string;
  date: string;
  fieldsFound: { merchant: boolean; amount: boolean; date: boolean };
}

const IGNORE_HEADER_LINE =
  /^(welcome|thank\s*you|customer\s*copy|merchant\s*copy|receipt|duplicate|transaction|cashier|register|terminal|store\s*#?\d+|tel|phone|fax|www\.|http|\d+\s+[a-z]+\s+(st|street|ave|rd|road|blvd|dr|drive|ln|way|hwy|pkwy))/i;

function extractVendor(lines: string[], userVendors: string[]): string {
  const fullText = lines.join(" ");
  for (const item of KNOWN_VENDORS) {
    if (item.pattern.test(fullText)) return item.name;
  }
  for (const custom of userVendors) {
    if (custom.length >= 3 && fullText.toLowerCase().includes(custom.toLowerCase())) {
      return cleanMerchantName(custom);
    }
  }
  for (const rawLine of lines.slice(0, 7)) {
    const cleaned = rawLine.replace(/[^a-zA-Z0-9\s&'-]/g, " ").replace(/\s+/g, " ").trim();
    const letterCount = (cleaned.match(/[a-zA-Z]/g) || []).length;
    if (
      letterCount >= 3 &&
      cleaned.length <= 36 &&
      !IGNORE_HEADER_LINE.test(cleaned) &&
      !/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(cleaned) &&
      !/\b[A-Za-z]{2}\s+\d{5}(?:-\d{4})?\b/.test(cleaned)
    ) {
      return cleanMerchantName(cleaned);
    }
  }
  return "";
}

function extractDate(rawText: string): string {
  const isoMatch = rawText.match(
    /\b(20\d{2})\s*[-/.]\s*(0?[1-9]|1[0-2])\s*[-/.]\s*(0?[1-9]|[12]\d|3[01])\b/
  );
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }
  const usMatch = rawText.match(
    /\b(0?[1-9]|1[0-2])\s*[/-]\s*(0?[1-9]|[12]\d|3[01])\s*[/-]\s*(20\d{2}|\d{2})\b/
  );
  if (usMatch) {
    const year = usMatch[3].length === 2 ? `20${usMatch[3]}` : usMatch[3];
    const yrNum = Number(year);
    if (yrNum >= 2018 && yrNum <= 2032) {
      return `${year}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
    }
  }
  const monthNames =
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})\b/i;
  const namedMatch = rawText.match(monthNames);
  if (namedMatch) {
    const parsed = new Date(`${namedMatch[1]} ${namedMatch[2]}, ${namedMatch[3]}`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  return "";
}

function extractTotal(lines: string[]): string {
  const totalLabel =
    /\b(grand\s*t[o0]tal|t[o0]tal\s*due|amount\s*due|balance\s*due|t[o0]tal\s*sale|sale\s*t[o0]tal|t[o0]t[a@]l|t[o0]tai|debit\s*tend|visa\s*tend|card\s*tend)\b/i;
  const excludeLabel =
    /\b(sub\s*[-]?t[o0]tal|tax|saved|savings|discount|change|cash\s*tend|cash\s*back|tip\s*guide)\b/i;
  const priceRegex = /\$?\s*(\d{1,5}[.,]\d{2})\b/g;

  const matchedTotals: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (totalLabel.test(line) && !excludeLabel.test(line)) {
      const matches = [...line.matchAll(priceRegex)];
      if (matches.length > 0) {
        const val = parseFloat(matches[matches.length - 1][1].replace(",", "."));
        if (val > 0 && val < 50000) matchedTotals.push(val);
      } else if (i + 1 < lines.length && !excludeLabel.test(lines[i + 1])) {
        const nextMatches = [...lines[i + 1].matchAll(priceRegex)];
        if (nextMatches.length > 0) {
          const val = parseFloat(nextMatches[0][1].replace(",", "."));
          if (val > 0 && val < 50000) matchedTotals.push(val);
        }
      }
    }
  }
  if (matchedTotals.length > 0) {
    return matchedTotals[matchedTotals.length - 1].toFixed(2);
  }

  const bottomLines = lines.slice(Math.floor(lines.length * 0.4));
  const fallbackPrices: number[] = [];
  for (const line of bottomLines) {
    if (!excludeLabel.test(line) && !/\bcash\b/i.test(line)) {
      for (const m of line.matchAll(priceRegex)) {
        const val = parseFloat(m[1].replace(",", "."));
        if (val > 0 && val < 10000) fallbackPrices.push(val);
      }
    }
  }
  return fallbackPrices.length > 0 ? Math.max(...fallbackPrices).toFixed(2) : "";
}

export function parseReceiptText(rawText: string, userVendors: string[] = []): ExtractedReceiptData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1);
  const merchant = extractVendor(lines, userVendors);
  const date = extractDate(rawText);
  const amount = extractTotal(lines);

  return {
    merchant,
    amount,
    date,
    fieldsFound: { merchant: Boolean(merchant), amount: Boolean(amount), date: Boolean(date) },
  };
}
