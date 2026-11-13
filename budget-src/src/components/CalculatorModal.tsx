import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyResult?: (val: string) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onCopyResult,
}) => {
  const [calcInput, setCalcInput] = useState("0");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const evaluateCurrent = (): string => {
    try {
      const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, "");
      if (!sanitized) return "0";
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return String(Number(result.toFixed(2)));
      }
      return "Error";
    } catch {
      return "Error";
    }
  };

  const handlePress = (btn: string) => {
    setCopied(false);
    if (btn === "C") {
      setCalcInput("0");
    } else if (btn === "⌫") {
      setCalcInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (btn === "=") {
      setCalcInput(evaluateCurrent());
    } else if (btn === "COPY") {
      const finalVal = evaluateCurrent();
      setCalcInput(finalVal);
      if (finalVal !== "Error") {
        navigator.clipboard?.writeText(finalVal);
        setCopied(true);
        onCopyResult?.(finalVal);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      setCalcInput((prev) => (prev === "0" || prev === "Error" ? btn : prev + btn));
    }
  };

  const buttons = [
    "C", "⌫", "/", "*",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", "=",
    "0", ".", "COPY",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[26px] max-w-sm w-full max-h-[85vh] flex flex-col p-5 shadow-2xl border border-slate-200 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-slate-900">Quick Calculator</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 text-right">
          <div className="text-xs font-mono text-slate-500 mb-1">Result / Entry:</div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono overflow-x-auto">
            {calcInput}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handlePress(btn)}
              className={`h-12 rounded-xl font-bold text-base transition cursor-pointer flex items-center justify-center gap-1 ${
                btn === "COPY"
                  ? "col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                  : btn === "="
                  ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black"
                  : btn === "C" || btn === "⌫"
                  ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                  : ["/", "*", "-", "+"].includes(btn)
                  ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              {btn === "COPY" ? (
                copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>$ Copy Total</span>
                  </>
                )
              ) : (
                btn
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
