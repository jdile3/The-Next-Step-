import React, { useEffect } from "react";
import { Account, Transaction } from "../types";
import { useReceiptScanner } from "../hooks/useReceiptScanner";
import { ReceiptCameraStep } from "./receipt/ReceiptCameraStep";
import { ReceiptReviewStep } from "./receipt/ReceiptReviewStep";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: string[];
  merchantRules?: Record<string, string>;
  onAddTransaction: (tx: Partial<Transaction>, alwaysCategorize: boolean) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  merchantRules = {},
  onAddTransaction,
}) => {
  const scanner = useReceiptScanner({
    isOpen,
    onClose,
    accounts,
    merchantRules,
    onAddTransaction,
  });

  useEffect(() => {
    if (!isOpen && !scanner.reviewData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (scanner.reviewData) {
          scanner.clearAndShredPhoto();
        } else {
          scanner.stopCamera();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, scanner]);

  if (!isOpen && !scanner.reviewData) return null;

  return (
    <>
      <input
        ref={scanner.phoneCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={scanner.handleFileChange}
      />
      <input
        ref={scanner.fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={scanner.handleFileChange}
      />

      {scanner.reviewData ? (
        <ReceiptReviewStep
          reviewData={scanner.reviewData}
          accounts={accounts}
          categories={categories}
          scanStatus={scanner.scanStatus}
          scanProgress={scanner.scanProgress}
          scanLabel={scanner.scanLabel}
          zoomedPhoto={scanner.zoomedPhoto}
          formError={scanner.formError}
          alwaysCategorize={scanner.alwaysCategorize}
          onToggleZoom={() => scanner.setZoomedPhoto(!scanner.zoomedPhoto)}
          onUpdateField={scanner.updateField}
          onToggleAlwaysCategorize={scanner.setAlwaysCategorize}
          onRetryScan={() => void scanner.executeReceiptScan(scanner.reviewData!.photoUrl, true)}
          onSave={scanner.handleSaveReviewed}
          onRetake={scanner.clearAndShredPhoto}
        />
      ) : (
        <ReceiptCameraStep
          isCameraActive={scanner.isCameraActive}
          cameraError={scanner.cameraError}
          videoRef={scanner.videoRef}
          onStartLiveCamera={() => void scanner.startLiveCamera()}
          onStopCamera={scanner.stopCamera}
          onCapturePhoto={scanner.capturePhoto}
          onOpenPhoneCamera={() => scanner.phoneCameraInputRef.current?.click()}
          onOpenFilePicker={() => scanner.fileInputRef.current?.click()}
          onClose={onClose}
        />
      )}
    </>
  );
};
