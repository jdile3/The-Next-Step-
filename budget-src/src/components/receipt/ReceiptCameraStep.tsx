import React from "react";
import { Camera, Upload, Eye, X, Sparkles } from "lucide-react";

interface ReceiptCameraStepProps {
  isCameraActive: boolean;
  cameraError: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartLiveCamera: () => void;
  onStopCamera: () => void;
  onCapturePhoto: () => void;
  onOpenPhoneCamera: () => void;
  onOpenFilePicker: () => void;
  onClose: () => void;
}

export const ReceiptCameraStep: React.FC<ReceiptCameraStepProps> = ({
  isCameraActive,
  cameraError,
  videoRef,
  onStartLiveCamera,
  onStopCamera,
  onCapturePhoto,
  onOpenPhoneCamera,
  onOpenFilePicker,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-scanner-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs"
    >
      <div className="flex flex-col w-full max-w-md max-h-[92vh] overflow-hidden rounded-[26px] bg-white border border-slate-200 text-center shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <h3 id="receipt-scanner-title" className="flex items-center gap-2 text-lg font-black text-slate-900">
            <Camera className="w-5 h-5 text-emerald-600" />
            <span>Scan Receipt</span>
          </h3>
          <button
            type="button"
            aria-label="Close receipt scanner"
            onClick={() => {
              onStopCamera();
              onClose();
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cameraError && (
            <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs font-bold text-amber-800">
              {cameraError}
            </div>
          )}

          {isCameraActive ? (
            <div className="space-y-2.5">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900">
                Fit Store Name (top), Date &amp; Total (bottom) inside the tall frame
              </div>

              <div className="relative w-full max-w-[300px] mx-auto overflow-hidden rounded-2xl bg-black aspect-[3/4] max-h-[56vh] border-2 border-emerald-500 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-y-2.5 inset-x-4 rounded-xl border-2 border-dashed border-emerald-400/85 pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-emerald-300/90 drop-shadow">
                    <span>┌ Store / Date</span>
                    <span>Top ┐</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-emerald-300/90 drop-shadow">
                    <span>└ Total Paid</span>
                    <span>Bottom ┘</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onCapturePhoto}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-black text-white shadow-md transition cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span>Snap &amp; Auto-Fill Fields</span>
                </button>
                <button
                  type="button"
                  onClick={onStopCamera}
                  className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-left">
              <div className="p-3.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Best for Paper Receipts (Live Smart Scanner)</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  Opens the tall portrait receipt frame right in the app—point at your paper receipt to grab the <strong>Vendor</strong>, <strong>Date</strong>, and <strong>Total</strong> automatically.
                </p>
                <button
                  type="button"
                  onClick={onStartLiveCamera}
                  className="flex flex-col items-center justify-center w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-sm font-black">
                    <Eye className="w-5 h-5 text-white shrink-0" />
                    <span>1. Open Live Smart Receipt Scanner</span>
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-emerald-100 text-center">
                    Scan a paper receipt live in portrait mode
                  </span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Or Scan From Phone Camera / Saved Photo
                </span>
                <button
                  type="button"
                  onClick={onOpenPhoneCamera}
                  className="flex flex-col items-center justify-center w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-xs font-black">
                    <Camera className="w-4 h-4 text-white shrink-0" />
                    <span>2. Snap Picture with Phone Camera</span>
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-sky-100 text-center">
                    Opens your phone&apos;s regular camera app to take a picture
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenFilePicker}
                  className="flex flex-col items-center justify-center w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <Upload className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>3. Upload Saved Photo or Screenshot</span>
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-slate-600 text-center">
                    Pick a receipt picture or screenshot already in your gallery
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
