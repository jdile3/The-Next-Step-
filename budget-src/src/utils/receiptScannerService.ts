import { recognize } from "tesseract.js";
import { cleanMerchantName, normalizeDate, parseMoney } from "./money";
import { ExtractedReceiptData, parseReceiptText } from "./receiptParser";
import { compressReceiptPhoto, preprocessReceiptForOcr } from "./receiptImageUtils";

export interface ScanProgressCallback {
  (progressPct: number, statusLabel: string): void;
}

interface ServerReceiptResponse {
  merchant?: string;
  amount?: number | string;
  date?: string;
}

async function tryServerScan(
  compressedDataUrl: string,
  onProgress?: ScanProgressCallback
): Promise<ExtractedReceiptData | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    onProgress?.(25, "Scanning receipt for Vendor, Date & Total...");
    const response = await fetch("/api/scan-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: compressedDataUrl }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const json = (await response.json()) as ServerReceiptResponse;

    const rawMerchant = typeof json.merchant === "string" ? json.merchant.trim() : "";
    const merchant = rawMerchant ? cleanMerchantName(rawMerchant) : "";
    const parsedNum = parseMoney(json.amount);
    const amount = parsedNum > 0 ? Math.abs(parsedNum).toFixed(2) : "";
    const rawDate = typeof json.date === "string" ? json.date.trim() : "";
    const normalizedDate = normalizeDate(rawDate);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate) ? normalizedDate : "";

    if (!merchant && !amount && !date) return null;

    onProgress?.(100, "Receipt fields extracted!");
    return {
      merchant,
      amount,
      date,
      fieldsFound: {
        merchant: Boolean(merchant),
        amount: Boolean(amount),
        date: Boolean(date),
      },
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function scanReceiptImage(
  imageDataUrl: string,
  userVendors: string[] = [],
  onProgress?: ScanProgressCallback
): Promise<ExtractedReceiptData> {
  onProgress?.(12, "Optimizing receipt image...");
  const compressedUrl = await compressReceiptPhoto(imageDataUrl);

  const isStaticHost =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("github.io") ||
      window.location.protocol === "file:" ||
      !navigator.onLine);
  if (!isStaticHost) {
    const serverResult = await tryServerScan(compressedUrl, onProgress);
    if (serverResult) {
      return serverResult;
    }
  }

  onProgress?.(35, "Running on-device optical receipt scan...");
  const processedDataUrl = await preprocessReceiptForOcr(compressedUrl);

  const ocrResult = await recognize(processedDataUrl, "eng", {
    logger: (msg) => {
      if (msg.status === "recognizing text" && typeof msg.progress === "number") {
        const pct = Math.min(95, Math.round(40 + msg.progress * 55));
        onProgress?.(pct, `Reading receipt text (${pct}%)...`);
      }
    },
  });

  onProgress?.(100, "Matching Vendor, Date & Total...");
  return parseReceiptText(ocrResult.data.text || "", userVendors);
}
