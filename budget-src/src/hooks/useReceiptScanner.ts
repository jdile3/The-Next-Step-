import React, { useState, useRef, useCallback } from "react";
import { Account, Transaction } from "../types";
import { autoCategorizeMerchant, cleanMerchantName, parseMoney } from "../utils/money";
import { getTodayStr } from "../utils/payPeriod";
import { scanReceiptImage } from "../utils/receiptScannerService";
import { useCameraStream } from "./useCameraStream";

export type ReceiptScanStatus = "loading" | "success" | "empty" | "error";

export interface ReceiptReviewData {
  photoUrl: string;
  merchant: string;
  amount: string;
  date: string;
  category: string;
  accountId: number | string;
  fieldsFound: { merchant: boolean; amount: boolean; date: boolean };
}

interface UseReceiptScannerParams {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  merchantRules: Record<string, string>;
  onAddTransaction: (tx: Partial<Transaction>, alwaysCategorize: boolean) => void;
}

export function useReceiptScanner(params: UseReceiptScannerParams) {
  const { isOpen, onClose, accounts, merchantRules, onAddTransaction } = params;
  const [zoomedPhoto, setZoomedPhoto] = useState(false);
  const [formError, setFormError] = useState("");
  const [alwaysCategorize, setAlwaysCategorize] = useState(false);
  const [userPickedCategory, setUserPickedCategory] = useState(false);
  const [scanStatus, setScanStatus] = useState<ReceiptScanStatus>("loading");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLabel, setScanLabel] = useState("");
  const [reviewData, setReviewData] = useState<ReceiptReviewData | null>(null);
  const phoneCameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearAndShredPhoto = useCallback(() => {
    setReviewData(null);
    setZoomedPhoto(false);
    setFormError("");
    setAlwaysCategorize(false);
    setUserPickedCategory(false);
    setScanProgress(0);
    setScanLabel("");
  }, []);

  const executeReceiptScan = useCallback(
    async (imageDataUrl: string, isRescan: boolean = false) => {
      setFormError("");
      setScanStatus("loading");
      setScanProgress(10);
      setScanLabel("Scanning receipt for Vendor, Date & Total...");
      setReviewData((prev) => ({
        photoUrl: imageDataUrl,
        merchant: isRescan && prev ? prev.merchant : "",
        amount: isRescan && prev ? prev.amount : "",
        date: isRescan && prev ? prev.date : getTodayStr(),
        category: isRescan && prev ? prev.category : "Other Spending",
        accountId: prev?.accountId || accounts[0]?.id || 1,
        fieldsFound: { merchant: false, amount: false, date: false },
      }));

      try {
        const res = await scanReceiptImage(imageDataUrl, Object.keys(merchantRules), (pct, lbl) => {
          setScanProgress(pct);
          setScanLabel(lbl);
        });
        const anyFound = res.fieldsFound.merchant || res.fieldsFound.amount || res.fieldsFound.date;
        setReviewData((prev) => {
          if (!prev) return null;
          const nextMerchant = res.merchant || prev.merchant;
          const nextAmount = res.amount || prev.amount;
          const nextDate = res.date || prev.date || getTodayStr();
          const nextCat = nextMerchant ? autoCategorizeMerchant(nextMerchant, -10, merchantRules) : prev.category;
          return { ...prev, merchant: nextMerchant, amount: nextAmount, date: nextDate, category: nextCat, fieldsFound: res.fieldsFound };
        });
        setScanStatus(anyFound ? "success" : "empty");
      } catch {
        setScanStatus("error");
      }
    },
    [accounts, merchantRules]
  );

  const camera = useCameraStream(isOpen, (dataUrl) => void executeReceiptScan(dataUrl, false));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
      setScanStatus("error");
      setFormError("Could not read the selected image file.");
    };
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      camera.stopCamera();
      void executeReceiptScan(reader.result, false);
    };
    reader.readAsDataURL(file);
  };

  const updateField = (field: "merchant" | "amount" | "date" | "accountId" | "category", value: string) => {
    if (!reviewData) return;
    setFormError("");
    if (field === "merchant") {
      const nextCat = !userPickedCategory && value.trim().length >= 2 ? autoCategorizeMerchant(value, -10, merchantRules) : reviewData.category;
      setReviewData({ ...reviewData, merchant: value, category: nextCat });
      return;
    }
    if (field === "category") setUserPickedCategory(true);
    setReviewData({ ...reviewData, [field]: value });
  };

  const handleSaveReviewed = () => {
    if (!reviewData) return;
    const parsedAmount = parseMoney(reviewData.amount);
    if (!parsedAmount || !reviewData.merchant.trim()) {
      setFormError("Please verify or enter both the Vendor name and the Receipt Total ($).");
      return;
    }
    const matchedAcc = accounts.find((a) => String(a.id) === String(reviewData.accountId));
    const cleanedDesc = cleanMerchantName(reviewData.merchant.trim());
    onAddTransaction(
      {
        description: cleanedDesc || reviewData.merchant.trim(),
        amount: -Math.abs(parsedAmount),
        date: reviewData.date || getTodayStr(),
        category: reviewData.category || "Other Spending",
        accountId: matchedAcc ? matchedAcc.id : reviewData.accountId,
        txType: "Receipt",
        source: "Receipt Scan",
      },
      alwaysCategorize
    );
    clearAndShredPhoto();
    onClose();
  };

  return {
    ...camera, zoomedPhoto, setZoomedPhoto, formError, alwaysCategorize, setAlwaysCategorize,
    scanStatus, scanProgress, scanLabel, reviewData, phoneCameraInputRef, fileInputRef,
    handleFileChange, clearAndShredPhoto, executeReceiptScan, updateField, handleSaveReviewed,
  };
}
