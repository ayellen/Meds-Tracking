import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Watch,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  QrCode,
  Sparkles,
  Share2,
  Download,
  Info,
} from 'lucide-react';

interface InstallOnWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const InstallOnWatchModal: React.FC<InstallOnWatchModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'phone-sideload' | 'adb'>('qr');

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-neutral-900 rounded-[10px] flex items-center justify-center text-sky-400">
                <Watch className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Install on your Wear OS Smartwatch
              </h3>
              <p className="text-xs text-neutral-400">
                Get this 1-tap Google Sheets logger onto your Pixel Watch, Galaxy Watch, or Wear OS device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 text-sm rounded-lg hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 flex items-center gap-2 border-b border-neutral-800/80 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-sky-500 text-sky-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Method 1: Instant Watch Link (QR Code)
          </button>

          <button
            onClick={() => setActiveTab('phone-sideload')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'phone-sideload'
                ? 'border-sky-500 text-sky-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Method 2: Install from Phone
          </button>

          <button
            onClick={() => setActiveTab('adb')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'adb'
                ? 'border-sky-500 text-sky-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            Method 3: Wireless ADB
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {/* TAB 1: QR CODE & DIRECT URL */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center">
                <QRCodeSVG
                  value={appUrl}
                  size={190}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Scan with your Phone to open or send to watch
                </span>
                <p className="text-[11px] text-neutral-400 max-w-sm">
                  1. Scan this QR code with your phone camera.<br />
                  2. Share the link to your watch via the <strong>Galaxy Wearable</strong> or <strong>Pixel Watch</strong> app, or open in the watch browser (Samsung Internet / Wear Internet Browser).
                </p>
              </div>

              {/* Direct Link Copy Box */}
              <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-left">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">
                    Watch App URL:
                  </span>
                  <span className="font-mono text-xs text-sky-400 truncate">
                    {appUrl}
                  </span>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition flex items-center gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FROM PHONE (EASY FIRE TOOLS / BUGJAEGER) */}
          {activeTab === 'phone-sideload' && (
            <div className="space-y-3.5">
              <div className="bg-sky-950/30 border border-sky-800/50 rounded-xl p-3 text-sky-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Install without a computer:</strong> You can install the APK onto your watch directly from your paired Android phone over Wi-Fi!
                </span>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-neutral-300">
                <li className="leading-relaxed">
                  <strong>Download a Wear OS sideload app on your phone:</strong>
                  <div className="text-[11px] text-neutral-400 ml-5 mt-0.5">
                    Install <strong>"Easy Fire Tools"</strong> or <strong>"Bugjaeger Mobile ADB"</strong> (free on Google Play Store).
                  </div>
                </li>

                <li className="leading-relaxed">
                  <strong>Enable Wireless Debugging on your Watch:</strong>
                  <div className="text-[11px] text-neutral-400 ml-5 mt-0.5">
                    On your watch, go to <em>Settings &gt; System &gt; About</em> and tap <strong>"Build number"</strong> 7 times. Then go to <em>Settings &gt; Developer options</em> and toggle on <strong>ADB debugging</strong> &amp; <strong>Wireless debugging</strong>.
                  </div>
                </li>

                <li className="leading-relaxed">
                  <strong>Connect &amp; Install:</strong>
                  <div className="text-[11px] text-neutral-400 ml-5 mt-0.5">
                    Open Easy Fire Tools on your phone, enter your watch's IP address (shown on your watch screen), tap <strong>Connect</strong>, select the exported APK, and tap <strong>Install to Watch</strong>.
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* TAB 3: WIRELESS ADB FROM COMPUTER */}
          {activeTab === 'adb' && (
            <div className="space-y-3.5">
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 text-emerald-200 flex items-start gap-2.5">
                <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Wireless ADB Sideloading:</strong> Install directly onto your watch from your local computer terminal over your home Wi-Fi.
                </span>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-neutral-400 font-sans block mb-1">
                    Step 1: Connect your computer to your watch IP:
                  </span>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-sky-300">
                    adb connect 192.168.1.XX:5555
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400 font-sans block mb-1">
                    Step 2: Accept the prompt on your watch screen:
                  </span>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-emerald-300">
                    Tap "Always allow from this computer" on your watch face
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400 font-sans block mb-1">
                    Step 3: Install the APK:
                  </span>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-sky-300">
                    adb install app-debug.apk
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Compatible with Pixel Watch, Galaxy Watch 4/5/6/7, and all Wear OS 3+ devices.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
