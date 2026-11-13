import React, { useState } from "react";
import { AppSettings } from "../types";
import {
  getPaywallStatus,
  startStripeCheckoutSession,
  verifyVipCode,
} from "../utils/paywall";
import { STRIPE_PAYMENT_LINK_URL } from "../utils/monetization";
import { Lock, Sparkles, KeyRound, ExternalLink } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onNotify: (msg: string) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onNotify,
}) => {
  const [vipCodeInput, setVipCodeInput] = useState("");
  const [vipError, setVipError] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const status = getPaywallStatus(settings);

  // Never open UpgradeModal if the user is already Pro
  if (!isOpen || status.isPro) return null;

  const logoSrc = `${import.meta.env.BASE_URL || "/"}assets/aistudio/The_Next_Step_Logo_Engraved_a3596208.png`;

  const handleApplyVipCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVipError("");
    setCheckoutNotice("");
    if (!vipCodeInput.trim()) {
      setVipError("Please enter a passcode.");
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyVipCode(vipCodeInput);
      if (isValid) {
        onUpdateSettings({
          ...settings,
          isPro: true,
          proSource: "vip_passcode",
        });
        onNotify("🎉 VIP Passcode Accepted: Lifetime Pro Unlocked! All ads & limits removed.");
        onClose();
      } else {
        setVipError("Invalid VIP passcode. Please check your code and try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartStripeCheckout = () => {
    setCheckoutNotice("");
    if (STRIPE_PAYMENT_LINK_URL && STRIPE_PAYMENT_LINK_URL.trim().startsWith("http")) {
      // Create a 30-minute expiring checkout session in localStorage before redirecting to Stripe
      startStripeCheckoutSession();
      window.location.href = STRIPE_PAYMENT_LINK_URL.trim();
    } else {
      setCheckoutNotice(
        "Online checkout is opening soon! Enjoy your 30-day full-access trial, or if you received a VIP Invite Code, enter it below to unlock Lifetime Pro now."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-[26px] w-full max-w-lg max-h-[88vh] overflow-hidden shadow-2xl text-white flex flex-col">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-contain bg-slate-950 p-1 border border-sky-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-wide">The Next Step: Pro</h3>
                {status.isTrialActive && (
                  <span className="text-[10px] font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                    {status.daysRemaining} DAYS TRIAL
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-400">Unlimited Accounts · Full More Tab · 100% Ad-Free</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Banner */}
          {status.isTrialActive ? (
            <div className="bg-sky-950/50 border border-sky-500/40 rounded-xl p-4 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <b className="text-sm font-bold text-sky-300 block">30-Day Full Access Trial Active</b>
                <span className="text-xs text-slate-300">
                  You have <strong>{status.daysRemaining} days remaining</strong> of unrestricted access. After 30 days, the Free Tier includes up to 2 accounts with ad support.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <b className="text-sm font-bold text-amber-300 block">30-Day Trial Ended</b>
                <span className="text-xs text-slate-300">
                  You are on the ad-supported Free Tier (maximum 2 accounts). Upgrade to unlock unlimited accounts, all planning tools, and zero ads.
                </span>
              </div>
            </div>
          )}

          {/* Feature Comparison */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">What Pro Includes:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-semibold text-slate-200">Bank & Cash Accounts</span>
                <span className="text-sky-300 font-bold">2 Free ➔ <strong>Unlimited in Pro</strong></span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-semibold text-slate-200">Bills & Loans Manager</span>
                <span className="text-sky-300 font-bold">Full Recurring Schedule</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-semibold text-slate-200">Reality Check & Leak Mirror</span>
                <span className="text-sky-300 font-bold">Habit Burn & Work Hours</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-semibold text-slate-200">Goals & What-If Planner</span>
                <span className="text-sky-300 font-bold">Full Access</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-semibold text-slate-200">Banner & Video Commercials</span>
                <span className="text-emerald-400 font-bold">100% Removed Forever</span>
              </div>
            </div>
          </div>

          {/* Upgrade Checkout Action */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleStartStripeCheckout}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-600 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-sky-900/40 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Upgrade to Lifetime Pro ($6.99 One-Time)</span>
              {STRIPE_PAYMENT_LINK_URL && <ExternalLink className="w-4 h-4" />}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              One-time unlock · No monthly subscription fees · Automatically unlocks this device on return
            </p>
            {checkoutNotice && (
              <div className="bg-sky-950/80 border border-sky-500/40 text-sky-200 text-xs font-medium p-3 rounded-xl leading-relaxed">
                {checkoutNotice}
              </div>
            )}
          </div>

          {/* VIP Passcode */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Have a VIP Invite Code?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your VIP code below to unlock Lifetime Pro:
            </p>

            <form onSubmit={handleApplyVipCode} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter VIP code..."
                  value={vipCodeInput}
                  onChange={(e) => {
                    setVipCodeInput(e.target.value);
                    setVipError("");
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white flex-1 outline-none placeholder:text-slate-500 focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shrink-0 cursor-pointer transition"
                >
                  {isVerifying ? "Checking..." : "Unlock"}
                </button>
              </div>
              {vipError && <p className="text-xs text-rose-400 font-semibold">{vipError}</p>}
            </form>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">100% Private · Zero Cloud Data Collection</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
