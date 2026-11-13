import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ReceiptPhotoPreviewProps {
  photoUrl: string;
  zoomedPhoto: boolean;
  onToggleZoom: () => void;
}

export const ReceiptPhotoPreview: React.FC<ReceiptPhotoPreviewProps> = ({
  photoUrl,
  zoomedPhoto,
  onToggleZoom,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-300 shadow-inner">
      <div
        className={`overflow-auto transition-all ${
          zoomedPhoto ? "max-h-64" : "max-h-36"
        } flex items-center justify-center bg-slate-950`}
      >
        <img
          src={photoUrl}
          alt="Scanned receipt preview"
          onClick={onToggleZoom}
          className={`cursor-zoom-in transition-transform duration-200 ${
            zoomedPhoto ? "scale-150 origin-top" : "w-full object-contain max-h-36"
          }`}
        />
      </div>
      <button
        type="button"
        onClick={onToggleZoom}
        className="absolute bottom-2 right-2 bg-black/75 hover:bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        {zoomedPhoto ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
        <span>{zoomedPhoto ? "Fit Photo" : "Zoom Receipt"}</span>
      </button>
    </div>
  );
};
