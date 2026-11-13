import React from "react";
import { X, Download } from "lucide-react";

interface FounderGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHIELD_VARIATIONS = [
  {
    id: "shield-1",
    badge: "👑 OFFICIAL MASTER LOGO • OPTION #3",
    title: "The Face of The Next Step (Solid Lime 4-Quarter Shield Crest)",
    subtitle:
      "Outer Shield = Recovery • 4 Clean Quarters = Tent (Unhoused), Key (Housing), Barbell (Iron), and $ (Money).",
    url: "/logo-master.jpg",
    filename: "The_Next_Step_Official_Master_Logo.jpg",
  },
  {
    id: "shield-5",
    badge: "ALTERNATE • DARK-CORE 5-EMBLEM DIAMOND SHIELD",
    title: "Dark-Core Neon Shield (All 5 Real Emblems)",
    subtitle:
      "Dark-navy interior with glowing 3D lime-green border & your exact 5 icons (Tent, Key, Barbell, Recovery Shield, and Center '$').",
    url: "/shield-var-5.jpg",
    filename: "The_Next_Step_Master_Shield_Dark_Core_5_Emblems.jpg",
  },
  {
    id: "shield-3",
    badge: "ALTERNATE • SOLID LIME 5-CELL DIAMOND CREST",
    title: "Solid Lime-Green 5-Cell Diamond Crest (All 5 Real Emblems)",
    subtitle:
      "Bold 3D lime-green shield with '$' in the center diamond and Tent, Key, Barbell, and Recovery Shield in the 4 outer cells.",
    url: "/shield-var-3.jpg",
    filename: "The_Next_Step_Master_Shield_Solid_Lime_5_Cells.jpg",
  },
  {
    id: "shield-2",
    badge: "ALTERNATE • DARK-CORE 4-QUARTER SHIELD",
    title: "Dark-Core 4-Quarter Shield (Tent, Key, $, Barbell)",
    subtitle:
      "High-contrast dark-navy shield face where the outer Shield is Recovery and the 4 quarters hold Tent, Key, '$', and Barbell.",
    url: "/shield-var-2.jpg",
    filename: "The_Next_Step_Master_Shield_Dark_Core_Four_Quarters.jpg",
  },
  {
    id: "shield-4",
    badge: "ALTERNATE • 5-STAR CROWNED CHAMPIONSHIP SHIELD",
    title: "5-Star Crowned Shield Crest",
    subtitle:
      "Crowned with 5 stars along the top rim, '$' in the center diamond, Tent & Key on top, and a full-width Barbell across the base.",
    url: "/shield-var-4.jpg",
    filename: "The_Next_Step_Master_Shield_Crowned_5_Star.jpg",
  },
];

export const FounderGalleryModal: React.FC<FounderGalleryModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col">
      {/* Top Bar */}
      <div className="px-4 py-3.5 bg-[#071224] border-b border-cyan-400/30 flex items-center justify-between gap-3 shrink-0">
        <div>
          <span className="text-[0.65rem] font-black uppercase tracking-widest text-emerald-300 block">
            Option #9 Evolved • Master Shield Crest Hub
          </span>
          <h2 className="text-base font-black text-white">
            5 Shield Crest Variations • Zero Stair Overlap
          </h2>
        </div>
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/50 text-rose-200 font-black text-xs flex items-center gap-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>
      </div>

      {/* Main Content Area: The 5 Shield Crest Variations */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="rounded-2xl bg-cyan-950/50 border border-cyan-400/30 p-3 text-xs text-cyan-100">
            All 5 variations fix the bottom-right corner overlap from the original Option #9 so every emblem inside the shield is 100% visible above the stairs. Tap <b>Save</b> under your favorite!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SHIELD_VARIATIONS.map((logo) => (
              <div
                key={logo.id}
                className="rounded-3xl bg-[#091526] border border-white/15 p-4 flex flex-col justify-between gap-3 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/35 text-[0.65rem] font-black text-cyan-300 uppercase tracking-wider">
                      {logo.badge}
                    </span>
                  </div>
                  <div className="aspect-square w-full max-w-[280px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-lg my-2">
                    <img
                      src={logo.url}
                      alt={logo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-sm font-black text-white mt-2">{logo.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {logo.subtitle}
                  </p>
                </div>

                <a
                  href={logo.url}
                  download={logo.filename}
                  className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 no-underline shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save {logo.badge.split("•")[0].trim()}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
