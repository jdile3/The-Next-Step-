import React, { useState, useEffect } from "react";
import { Play, CheckCircle2, Sparkles, Volume2 } from "lucide-react";
import { VIDEO_AD_CONFIG } from "../utils/monetization";

interface VideoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeClick: () => void;
  isPro: boolean;
}

export const VideoAdModal: React.FC<VideoAdModalProps> = ({
  isOpen,
  onClose,
  onUpgradeClick,
  isPro,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(VIDEO_AD_CONFIG.skipDelaySeconds);

  useEffect(() => {
    if (!isOpen || isPro) return;
    setSecondsLeft(VIDEO_AD_CONFIG.skipDelaySeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPro]);

  // Never show video ads if Pro is unlocked
  if (!isOpen || isPro) return null;

  const canSkip = secondsLeft <= 0;
  const progressPct = Math.min(
    100,
    Math.round(
      ((VIDEO_AD_CONFIG.skipDelaySeconds - secondsLeft) /
        Math.max(1, VIDEO_AD_CONFIG.skipDelaySeconds)) *
        100
    )
  );

  const handleCta = () => {
    if (
      VIDEO_AD_CONFIG.ctaUrl &&
      VIDEO_AD_CONFIG.ctaUrl !== "INTERNAL_UPGRADE" &&
      VIDEO_AD_CONFIG.ctaUrl.startsWith("http")
    ) {
      window.location.href = VIDEO_AD_CONFIG.ctaUrl;
    } else {
      onClose();
      onUpgradeClick();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-[26px] max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl text-white">
        {/* Top Commercial Status Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Video Ad
            </span>
            <span className="text-xs text-slate-400 font-semibold truncate">
              {VIDEO_AD_CONFIG.sponsorName}
            </span>
          </div>

          <button
            disabled={!canSkip}
            onClick={onClose}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
              canSkip
                ? "bg-white hover:bg-slate-200 text-slate-950 cursor-pointer shadow-sm"
                : "bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            {canSkip ? "Skip Ad ⏭" : `Skip in ${secondsLeft}s`}
          </button>
        </div>

        {/* Video / Animated Commercial Viewport */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {VIDEO_AD_CONFIG.videoMp4Url ? (
            <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 relative">
              <video
                src={VIDEO_AD_CONFIG.videoMp4Url}
                autoPlay
                muted
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-[#061629] via-sky-950 to-slate-950 border border-cyan-500/30 p-6 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black px-3 py-1 rounded-full">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Commercial Break · Free Tier</span>
                </div>
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {VIDEO_AD_CONFIG.headline}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {VIDEO_AD_CONFIG.subheadline}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {VIDEO_AD_CONFIG.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{canSkip ? "Ad complete — you may skip or upgrade below" : "Playing sponsor message..."}</span>
              <span>{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={handleCta}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{VIDEO_AD_CONFIG.ctaText}</span>
          </button>

          {canSkip && (
            <button
              onClick={onClose}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
            >
              Continue Free
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
