import React, { useState, useEffect } from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import { ADSENSE_CONFIG, SPONSOR_BANNERS } from "../utils/monetization";

interface AdBannerProps {
  onUpgradeClick?: () => void;
  isPro?: boolean;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  onUpgradeClick,
  isPro = false,
  className = "",
}) => {
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    if (isPro || SPONSOR_BANNERS.length <= 1) return;
    // Rotate sponsor banner on mount & every 25 seconds
    setBannerIndex(Math.floor(Math.random() * SPONSOR_BANNERS.length));
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % SPONSOR_BANNERS.length);
    }, 25000);
    return () => clearInterval(timer);
  }, [isPro]);

  // Never render any ad banner or upgrade link when Pro is unlocked
  if (isPro) return null;

  const currentBanner = SPONSOR_BANNERS[bannerIndex] || SPONSOR_BANNERS[0];

  const handleAction = () => {
    if (
      currentBanner.ctaUrl &&
      currentBanner.ctaUrl !== "INTERNAL_UPGRADE" &&
      currentBanner.ctaUrl.startsWith("http")
    ) {
      window.location.href = currentBanner.ctaUrl;
    } else {
      onUpgradeClick?.();
    }
  };

  return (
    <div
      className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${className}`}
    >
      {ADSENSE_CONFIG.enabled && ADSENSE_CONFIG.publisherId ? (
        <div className="w-full text-center py-1">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CONFIG.publisherId}
            data-ad-slot={ADSENSE_CONFIG.bannerSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[0.68rem] font-black uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Sponsored
                </span>
                <span className="text-xs font-bold text-cyan-300">{currentBanner.tag}</span>
              </div>
              <b className="text-sm font-black text-white block mt-0.5">
                {currentBanner.title}
              </b>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{currentBanner.description}</p>
            </div>
          </div>

          <button
            onClick={handleAction}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs rounded-xl shrink-0 transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <span>{currentBanner.ctaText}</span>
            {currentBanner.ctaUrl &&
              currentBanner.ctaUrl !== "INTERNAL_UPGRADE" &&
              currentBanner.ctaUrl.startsWith("http") && <ExternalLink className="w-3.5 h-3.5" />}
          </button>
        </>
      )}
    </div>
  );
};
