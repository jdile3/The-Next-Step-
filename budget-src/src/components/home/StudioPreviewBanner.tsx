import React, { useState } from "react";
import { FounderGalleryModal } from "../FounderGalleryModal";

export const StudioPreviewBanner: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const isAiStudioPreview =
    typeof window !== "undefined" && !window.location.hostname.includes("github.io");

  if (!isAiStudioPreview || hidden) {
    return null;
  }

  return (
    <>
      <div className="p-3.5 rounded-3xl bg-emerald-950/90 border border-emerald-400/60 text-white shadow-xl space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.7rem] font-black uppercase tracking-wider text-emerald-300">
            ⚡ Master Brand Icon Preview Hub
          </span>
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-[0.68rem] font-bold text-slate-300 hover:text-white cursor-pointer"
          >
            Hide
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href="/harm-reduction.html"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 hover:opacity-95 text-xs font-black text-slate-950 shadow-lg transition cursor-pointer"
          >
            <span>🩺 Preview Harm Reduction Hub ↗</span>
          </a>

          <a
            href="/website-preview"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-xs font-black text-slate-950 shadow-lg transition cursor-pointer"
          >
            <span>🌐 Preview Main Website ↗</span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setShowGallery(true)}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-emerald-400/40 text-[11px] font-bold text-emerald-200 transition cursor-pointer"
        >
          <span>🛡️ Open 5 Shield Crest Variations</span>
        </button>
      </div>

      <FounderGalleryModal isOpen={showGallery} onClose={() => setShowGallery(false)} />
    </>
  );
};
