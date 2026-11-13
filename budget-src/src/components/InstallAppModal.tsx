import React, { useState, useEffect } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { AppData } from "../types";
import { getPublicShareUrl } from "../utils/monetization";
import {
  Check,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Smartphone,
  Monitor,
  ShieldCheck,
  Share2,
} from "lucide-react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "cloud" | "android" | "windows" | "share";
  data?: AppData;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportRawData?: (rawText: string) => boolean;
  onNotify?: (msg: string) => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  initialTab = "cloud",
  data,
  onExportBackup,
  onImportBackup,
  onImportRawData,
  onNotify,
}) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"cloud" | "android" | "windows" | "share">(initialTab);

  // Sync Hub quick code copy & paste state
  const [syncCopied, setSyncCopied] = useState(false);
  const [rawSyncInput, setRawSyncInput] = useState("");
  const [syncError, setSyncError] = useState("");
  const [syncSuccess, setSyncSuccess] = useState("");
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadMsg, setDownloadMsg] = useState("");
  const [manualInstallHint, setManualInstallHint] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || "cloud");
      setSyncError("");
      setSyncSuccess("");
      setRawSyncInput("");
      setManualInstallHint(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentUrl = getPublicShareUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    if (onNotify) onNotify("App link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "The Next Step — Budgeting",
          text: "Check out The Next Step — a private, zero-cloud budgeting app that protects your bills first and shows your exact Free-to-Spend limit.",
          url: currentUrl,
        });
        return;
      } catch {
        // Fallback to copy link if user cancels native share
      }
    }
    handleCopyLink();
  };

  const handleCopySyncData = () => {
    if (!data) return;
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(jsonStr);
      setSyncCopied(true);
      if (onNotify) onNotify("📋 Budget sync code copied! Ready to paste on your other device.");
      setTimeout(() => setSyncCopied(false), 3000);
    } catch {
      setSyncError("Could not copy data to clipboard. Try downloading a backup file instead.");
    }
  };

  const handleApplySyncText = () => {
    setSyncError("");
    setSyncSuccess("");
    if (!rawSyncInput.trim()) {
      setSyncError("Please paste your sync code into the box first.");
      return;
    }
    if (onImportRawData) {
      const ok = onImportRawData(rawSyncInput.trim());
      if (ok) {
        setSyncSuccess("🎉 Synced successfully! Your budget is now up to date.");
        setRawSyncInput("");
      } else {
        setSyncError("Invalid sync code format. Make sure you copied the entire code.");
      }
    }
  };

  const handleDownloadServerBundle = async (endpoint: string, filename: string) => {
    setDownloadingFile(filename);
    setDownloadMsg(`Preparing ${filename}...`);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const blob = await res.blob();
      if (blob.size < 500) {
        throw new Error("Generated file was unexpectedly small.");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      const sizeKb = Math.round(blob.size / 1024);
      setDownloadMsg(`✅ Downloaded ${filename} (${sizeKb} KB)!`);
    } catch {
      setDownloadMsg(`❌ Could not download ${filename}. Please try again.`);
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-[26px] w-full max-w-lg max-h-[88vh] overflow-hidden shadow-2xl text-white flex flex-col">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL || "/"}assets/aistudio/The_Next_Step_Logo_Engraved_a3596208.png`}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-contain bg-slate-950 p-1 border border-sky-500/30 shrink-0"
            />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide leading-tight">
                Sync, Install & Share
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                Device Sync · Phone App · Desktop · Share
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* FOUNDER QUICK-DOWNLOAD BAR (Visible immediately at top of modal in AI Studio) */}
        {typeof window !== "undefined" && !window.location.hostname.includes("github.io") && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-3 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                ⚡ Studio Quick Downloads (Ready for GitHub)
              </span>
              {downloadMsg && (
                <span className="text-[11px] font-bold text-amber-300">{downloadMsg}</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!!downloadingFile}
                onClick={() =>
                  handleDownloadServerBundle("/api/download-budget-single-html", "budget.html")
                }
                className="py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Download Fixed budget.html</span>
              </button>

              <button
                type="button"
                disabled={!!downloadingFile}
                onClick={() =>
                  handleDownloadServerBundle(
                    "/api/download-github-pages-zip",
                    "the-next-step-github-flat-bundle.zip"
                  )
                }
                className="py-2.5 px-3 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Full GitHub Bundle (.ZIP)</span>
              </button>

              <button
                type="button"
                disabled={!!downloadingFile}
                onClick={() =>
                  handleDownloadServerBundle(
                    "/api/download-complete-project-zip",
                    "the-next-step-complete-source-and-docs.zip"
                  )
                }
                className="py-2.5 px-3 bg-purple-400 hover:bg-purple-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950 shrink-0" />
                <span>ALL Source & Docs (.ZIP)</span>
              </button>

              <button
                type="button"
                disabled={!!downloadingFile}
                onClick={() =>
                  handleDownloadServerBundle(
                    "/api/download-social-media-pack-zip",
                    "the-next-step-social-media-and-logos.zip"
                  )
                }
                className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950 shrink-0" />
                <span>5 Logos + Docs (.ZIP)</span>
              </button>
            </div>
          </div>
        )}

        {/* 2x2 Touch-Friendly Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950 p-2 gap-1.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab("cloud")}
            className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
              activeTab === "cloud"
                ? "bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-black shadow-md"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${activeTab === "cloud" ? "text-amber-400" : "text-slate-400"}`} />
            <span>Sync Devices</span>
          </button>

          <button
            onClick={() => setActiveTab("android")}
            className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
              activeTab === "android"
                ? "bg-emerald-500/25 border-2 border-emerald-400 text-emerald-300 font-black shadow-md"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Phone App</span>
          </button>

          <button
            onClick={() => setActiveTab("windows")}
            className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
              activeTab === "windows"
                ? "bg-sky-500/25 border-2 border-sky-400 text-sky-300 font-black shadow-md"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>Computer</span>
          </button>

          <button
            onClick={() => setActiveTab("share")}
            className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
              activeTab === "share"
                ? "bg-purple-500/25 border-2 border-purple-400 text-purple-300 font-black shadow-md"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            <span>Share App</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: SYNC HUB (PHONE & PC) */}
          {activeTab === "cloud" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-950/50 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Direct Device-to-Device Sync</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Keep your phone and computer matched in seconds. Your financial data stays 100% in your personal possession—no third-party servers ever hold your banking records.
                </p>
              </div>

              {/* METHOD 1: QUICK COPY / PASTE CODE */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <b className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    Method 1: Instant Sync Code (Fastest)
                  </b>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                    No Files Needed
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Step 1: Tap below on the device that has your latest budget to copy your sync code:
                </p>

                <button
                  onClick={handleCopySyncData}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
                >
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>{syncCopied ? "✅ Sync Code Copied to Clipboard!" : "1. Copy My Budget Sync Code"}</span>
                </button>

                <div className="space-y-2 pt-3 border-t border-slate-700/80">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Step 2: Send the code to your other device (message, email, or notes), paste it below, and tap <strong>Apply & Sync</strong>:
                  </p>

                  <textarea
                    rows={3}
                    placeholder="Paste your sync code here on your other device..."
                    value={rawSyncInput}
                    onChange={(e) => {
                      setRawSyncInput(e.target.value);
                      setSyncError("");
                      setSyncSuccess("");
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200 outline-none focus:border-amber-400 resize-none placeholder:text-slate-500"
                  />

                  {syncError && <p className="text-xs text-rose-400 font-bold">{syncError}</p>}
                  {syncSuccess && <p className="text-xs text-emerald-400 font-bold">{syncSuccess}</p>}

                  <button
                    onClick={handleApplySyncText}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>2. Apply & Sync Budget Now</span>
                  </button>
                </div>
              </div>

              {/* METHOD 2: BACKUP FILE (.JSON) */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-xs">
                <b className="text-xs font-black text-sky-300 uppercase tracking-wider block">
                  Method 2: Personal Cloud Drive File (.JSON)
                </b>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Prefer using your own Google Drive, OneDrive, or thumb drive? Save a backup file and load it on any device:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {onExportBackup && (
                    <button
                      onClick={onExportBackup}
                      className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-600 transition"
                    >
                      <Download className="w-4 h-4 text-sky-400" />
                      <span>Save Backup File</span>
                    </button>
                  )}

                  {onImportBackup && (
                    <label className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-600 transition text-center">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Load Backup File</span>
                      <input type="file" accept=".json" onChange={onImportBackup} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* PRIVACY GUARANTEE */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>100% Zero-Data-Possession Privacy:</strong> Your numbers stay on your devices and never pass through corporate data brokers.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PHONE APP INSTALL */}
          {activeTab === "android" && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span>📱</span> Install on Your Phone
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Install <em>The Next Step</em> directly to your phone's home screen and app drawer for instant 1-tap access and full offline speed.
                </p>
              </div>

              {!isInstalled && (
                <button
                  onClick={async () => {
                    if (isInstallable) {
                      await install();
                    } else {
                      setManualInstallHint(true);
                      if (onNotify) {
                        onNotify(
                          "Tap your browser's top-right menu (⋮) and select 'Install app' or 'Add to Home screen'!"
                        );
                      }
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>Install App to Home Screen Now</span>
                </button>
              )}

              {manualInstallHint && !isInstallable && !isInstalled && (
                <div className="bg-amber-950/60 border-2 border-amber-400 text-amber-200 px-4 py-3 rounded-xl text-xs space-y-1">
                  <div className="font-black text-amber-300 uppercase tracking-wide">
                    📲 2-Tap Browser Install:
                  </div>
                  <p className="leading-relaxed">
                    Tap the <strong>menu icon (⋮)</strong> in the top-right corner of Chrome (or the <strong>Share icon</strong> in Safari) and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>!
                  </p>
                </div>
              )}

              {isInstalled && (
                <div className="bg-teal-900/40 border border-teal-500/40 text-teal-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                  <span>✅</span> App is installed and running in standalone mode!
                </div>
              )}

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Quick Phone Setup Steps:
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Open this link in <strong>Google Chrome</strong> on your phone:</li>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg p-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="bg-transparent text-xs text-sky-300 flex-1 outline-none font-mono select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      {copiedLink ? "Copied! ✓" : "Copy Link"}
                    </button>
                  </div>
                  <li>Tap the <strong>menu button (⋮)</strong> in the top-right corner of Chrome.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: WINDOWS / COMPUTER DESKTOP */}
          {activeTab === "windows" && (
            <div className="space-y-4">
              <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <span>💻</span> Install Desktop App (Windows / Mac)
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Run <em>The Next Step</em> in its own dedicated desktop window, pinned right to your Windows Taskbar or Start Menu.
                </p>
              </div>

              {!isInstalled && (
                <button
                  onClick={async () => {
                    if (isInstallable) {
                      await install();
                    } else {
                      setManualInstallHint(true);
                      if (onNotify) {
                        onNotify(
                          "Click the Install icon on the right side of your Chrome/Edge address bar to pin to your Desktop!"
                        );
                      }
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>Install Desktop App Now</span>
                </button>
              )}

              {manualInstallHint && !isInstallable && !isInstalled && (
                <div className="bg-amber-950/60 border-2 border-amber-400 text-amber-200 px-4 py-3 rounded-xl text-xs space-y-1">
                  <div className="font-black text-amber-300 uppercase tracking-wide">
                    💻 1-Click Address Bar Install:
                  </div>
                  <p className="leading-relaxed">
                    Look at the right side of your Chrome or Edge address bar for the <strong>Install icon</strong> (computer monitor with a down arrow), or open the browser menu (<strong>⋮</strong>) and click <strong>"Cast, save, and share → Install page as app"</strong>!
                  </p>
                </div>
              )}

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3 text-xs text-slate-300">
                <h4 className="font-bold text-white uppercase tracking-wider">
                  How to Pin to Your Computer Taskbar:
                </h4>
                <div className="space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-sky-300 font-bold">1.</strong> Look at the right side of your Chrome or Edge address bar for the <strong>Install icon</strong> (computer monitor with a down arrow).
                  </p>
                  <p>
                    <strong className="text-sky-300 font-bold">2.</strong> Click <strong>Install</strong> to place <em>The Next Step</em> on your Desktop and Taskbar for 1-click launching anytime.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHARE APP WITH A FRIEND */}
          {activeTab === "share" && (
            <div className="space-y-4">
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span>Share "The Next Step" with a Friend</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Know someone tired of overdraft fees, surprise bills, or apps that spy on their bank login? Send them the link or let them scan the QR code below.
                </p>
              </div>

              <button
                onClick={handleNativeShare}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? "✅ Link Copied to Clipboard!" : "Share App Link via Text / Social"}</span>
              </button>

              <div className="text-center p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs text-slate-300 font-semibold">
                  Or have a friend scan this QR code with their phone camera:
                </p>
                <div className="inline-block p-2.5 bg-white rounded-2xl shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`}
                    alt="Scan to open The Next Step"
                    className="w-36 h-36"
                    loading="lazy"
                  />
                </div>
              </div>

              {typeof window !== "undefined" && !window.location.hostname.includes("github.io") && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                    Studio Export Tool (Hidden from Public Users)
                  </div>

                  <div className="space-y-2 bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3">
                    <div className="text-xs font-bold text-emerald-300">
                      1. Complete Flat GitHub Bundle (.ZIP — Zero Subfolders!):
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Unzip and drag-and-drop all flat files (<code className="text-emerald-300">index.html</code>, <code className="text-emerald-300">budget.html</code>, <code className="text-amber-300">ads-and-links.js</code>, <code className="text-sky-300">manifest.json</code>, <code className="text-sky-300">sw.js</code>, and the app icons) into your GitHub repository to unlock 1-tap Phone & Computer installing:
                    </p>
                    <button
                      type="button"
                      disabled={!!downloadingFile}
                      onClick={() =>
                        handleDownloadServerBundle(
                          "/api/download-github-pages-zip",
                          "the-next-step-github-flat-bundle.zip"
                        )
                      }
                      className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>
                        {downloadingFile === "the-next-step-github-flat-bundle.zip"
                          ? "Compiling & Zipping Flat Bundle..."
                          : "Download Complete Flat GitHub Bundle (.ZIP)"}
                      </span>
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
                    <div className="text-xs font-bold text-amber-300">
                      2. Or Download Individual Files Directly:
                    </div>
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      <button
                        type="button"
                        disabled={!!downloadingFile}
                        onClick={() =>
                          handleDownloadServerBundle("/api/download-ads-config", "ads-and-links.js")
                        }
                        className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-slate-950 shrink-0" />
                        <span>Download ads-and-links.js (2 KB Easy Edit Config)</span>
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          disabled={!!downloadingFile}
                          onClick={() =>
                            handleDownloadServerBundle("/api/download-website-index", "index.html")
                          }
                          className="py-2 px-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                          <span>index.html</span>
                        </button>

                        <button
                          type="button"
                          disabled={!!downloadingFile}
                          onClick={() =>
                            handleDownloadServerBundle(
                              "/api/download-harm-reduction",
                              "harm-reduction.html"
                            )
                          }
                          className="py-2 px-2 bg-rose-400 hover:bg-rose-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                          <span>harm-reduction</span>
                        </button>

                        <button
                          type="button"
                          disabled={!!downloadingFile}
                          onClick={() =>
                            handleDownloadServerBundle(
                              "/api/download-budget-single-html",
                              "budget.html"
                            )
                          }
                          className="py-2 px-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                          <span>budget.html</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/80 border border-purple-500/40 rounded-xl p-3">
                    <div className="text-xs font-bold text-purple-300">
                      🎨 Social Media Ecosystem Logos & Manifesto Pack:
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      All 5 matching <em>The Next Step</em> app logos (Money, Iron/Gym, Housing & Keys, Recovery Shield, and Unhoused Tent) + your polished Manifesto & Social Media copy:
                    </p>
                    <div className="grid grid-cols-5 gap-1.5 py-1">
                      <a
                        href="/assets/logos/the_next_step_money_logo.png"
                        download="1_The_Next_Step_Money_Logo.png"
                        className="flex flex-col items-center bg-slate-900 p-1 rounded-lg border border-slate-700 hover:border-sky-400 transition"
                        title="Tap to save Money Logo"
                      >
                        <img
                          src="/assets/logos/the_next_step_money_logo.png"
                          alt="Money Logo"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <span className="text-[9px] font-bold text-sky-300 mt-1">Money</span>
                      </a>
                      <a
                        href="/assets/logos/the_next_step_iron_gym_logo.jpg"
                        download="2_The_Next_Step_Iron_Gym_Logo.jpg"
                        className="flex flex-col items-center bg-slate-900 p-1 rounded-lg border border-slate-700 hover:border-lime-400 transition"
                        title="Tap to save Iron/Gym Logo"
                      >
                        <img
                          src="/assets/logos/the_next_step_iron_gym_logo.jpg"
                          alt="Gym Logo"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <span className="text-[9px] font-bold text-lime-300 mt-1">Gym</span>
                      </a>
                      <a
                        href="/assets/logos/the_next_step_housing_logo.jpg"
                        download="3_The_Next_Step_Housing_Keys_Logo.jpg"
                        className="flex flex-col items-center bg-slate-900 p-1 rounded-lg border border-slate-700 hover:border-emerald-400 transition"
                        title="Tap to save Housing Logo"
                      >
                        <img
                          src="/assets/logos/the_next_step_housing_logo.jpg"
                          alt="Housing Logo"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <span className="text-[9px] font-bold text-emerald-300 mt-1">Housing</span>
                      </a>
                      <a
                        href="/assets/logos/the_next_step_recovery_logo.jpg"
                        download="4_The_Next_Step_Recovery_Shield_Logo.jpg"
                        className="flex flex-col items-center bg-slate-900 p-1 rounded-lg border border-slate-700 hover:border-cyan-400 transition"
                        title="Tap to save Recovery Logo"
                      >
                        <img
                          src="/assets/logos/the_next_step_recovery_logo.jpg"
                          alt="Recovery Logo"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <span className="text-[9px] font-bold text-cyan-300 mt-1">Recovery</span>
                      </a>
                      <a
                        href="/assets/logos/the_next_step_unhoused_logo.jpg"
                        download="5_The_Next_Step_Unhoused_Tent_Logo.jpg"
                        className="flex flex-col items-center bg-slate-900 p-1 rounded-lg border border-slate-700 hover:border-rose-400 transition"
                        title="Tap to save Unhoused Logo"
                      >
                        <img
                          src="/assets/logos/the_next_step_unhoused_logo.jpg"
                          alt="Unhoused Logo"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <span className="text-[9px] font-bold text-rose-300 mt-1">Street</span>
                      </a>
                    </div>
                    <button
                      type="button"
                      disabled={!!downloadingFile}
                      onClick={() =>
                        handleDownloadServerBundle(
                          "/api/download-social-media-pack-zip",
                          "the-next-step-social-media-and-logos.zip"
                        )
                      }
                      className="w-full py-2.5 px-4 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-white shrink-0" />
                      <span>
                        {downloadingFile === "the-next-step-social-media-and-logos.zip"
                          ? "Zipping Logos & Manifesto..."
                          : "Download All 5 Logos + Manifesto Pack (.ZIP)"}
                      </span>
                    </button>
                  </div>

                  {downloadMsg && (
                    <p className="text-xs font-bold text-emerald-300 text-center pt-1">
                      {downloadMsg}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 truncate pr-2">
            {platform === "android"
              ? "📱 Mobile Device Ready"
              : platform === "windows"
              ? "💻 Desktop App Ready"
              : "🔒 100% Local & Private"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
