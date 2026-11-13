import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Erase All Data?",
  message = "This will permanently erase all transactions, bills, custom categories, and goals, and reset your accounts back to starter Checking and Savings. Are you sure?",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[26px] max-w-sm w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 text-center overflow-y-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shrink-0">
          <AlertTriangle className="w-6 h-6 text-rose-700" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-xl cursor-pointer transition shadow-md text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
