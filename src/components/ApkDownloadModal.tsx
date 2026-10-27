import React, { useState } from 'react';
import {
  Download,
  Watch,
  Smartphone,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Wifi,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeInstallTab, setActiveInstallTab] = useState<'watch' | 'phone' | 'adb'>('watch');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 flex items-center justify-center shadow">
              <div className="w-full h-full bg-neutral-900 rounded-[10px] flex items-center justify-center">
                <Download className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Download Wear OS & Android APK
                </h3>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono px-2 py-0.2 rounded-full font-semibold">
                  Signed & Ready
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Package: <code className="text-sky-300">com.wearos.medlogger</code> • Universal APK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Main APK Download Card */}
        <div className="my-5 bg-gradient-to-br from-neutral-800/80 via-neutral-900 to-sky-950/30 border border-neutral-700/80 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  WearOS-Medication-Logger.apk
                </span>
                <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[11px] font-mono">
                  v1.0.0
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 mt-1.5 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Signed Release
                </span>
                <span>•</span>
                <span>Size: ~197 KB</span>
                <span>•</span>
                <span>Target: Android 14+ / Wear OS 3, 4, 5</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <a
                href="/WearOS-Medication-Logger.apk"
                download="WearOS-Medication-Logger.apk"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-black font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Download APK
              </a>

              <a
                href="/WearOS-Medication-Logger-Source.zip"
                download="WearOS-Medication-Logger-Source.zip"
                title="Download complete Android Studio Project source code"
                className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold border border-neutral-700 transition flex items-center justify-center gap-1.5"
              >
                <FileCode className="w-4 h-4 text-neutral-400" />
                Source Zip
              </a>
            </div>
          </div>
        </div>

        {/* Installation Instructions Tab Bar */}
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="text-neutral-400 font-semibold text-[11px] uppercase tracking-wider mr-2">
              Install Guide:
            </span>
            <button
              onClick={() => setActiveInstallTab('watch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeInstallTab === 'watch'
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white bg-neutral-800/60'
              }`}
            >
              <Watch className="w-3.5 h-3.5" />
              Wear OS Watch (Wireless)
            </button>
            <button
              onClick={() => setActiveInstallTab('adb')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeInstallTab === 'adb'
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white bg-neutral-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Command Line (ADB)
            </button>
            <button
              onClick={() => setActiveInstallTab('phone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeInstallTab === 'phone'
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white bg-neutral-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android Phone
            </button>
          </div>

          {/* Tab 1: Wear OS Smartwatch Wireless Install */}
          {activeInstallTab === 'watch' && (
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Wifi className="w-4 h-4 text-sky-400" />
                How to install on Samsung Galaxy Watch / Google Pixel Watch / Wear OS:
              </h4>

              <div className="space-y-2 text-neutral-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 font-mono text-[11px] font-bold">
                    1
                  </span>
                  <span>
                    <strong>Enable Developer Options on your Watch:</strong> On your watch, go to <em>Settings → System → About → Versions</em> and tap <strong>Build Number</strong> 7 times until it says "You are now a developer".
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 font-mono text-[11px] font-bold">
                    2
                  </span>
                  <span>
                    <strong>Enable Wireless Debugging:</strong> Under <em>Settings → Developer options</em>, turn on <strong>ADB debugging</strong> and <strong>Wireless debugging</strong>. Note the IP address and port shown.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 font-mono text-[11px] font-bold">
                    3
                  </span>
                  <span>
                    <strong>Send via Phone App (Easiest):</strong> Download the free app <strong>Wear Installer 2</strong> or <strong>Easy Fire Tools</strong> on your Android phone, pick the downloaded <code className="text-sky-300">WearOS-Medication-Logger.apk</code>, and tap Install!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: ADB Command Line */}
          {activeInstallTab === 'adb' && (
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Install directly using standard Android SDK (ADB):
              </h4>

              <div className="space-y-2">
                <div>
                  <span className="text-neutral-400 block mb-1">
                    1. Connect to your watch over Wi-Fi (or plug phone in via USB):
                  </span>
                  <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg border border-neutral-700/70 font-mono text-neutral-200 text-[11px]">
                    <code>adb connect 192.168.1.XX:5555</code>
                    <button
                      onClick={() => handleCopy('adb connect 192.168.1.XX:5555', 'connect')}
                      className="text-neutral-400 hover:text-white p-1"
                      title="Copy"
                    >
                      {copiedCmd === 'connect' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400 block mb-1">
                    2. Install the signed APK to your device:
                  </span>
                  <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg border border-neutral-700/70 font-mono text-neutral-200 text-[11px]">
                    <code>adb install -r WearOS-Medication-Logger.apk</code>
                    <button
                      onClick={() => handleCopy('adb install -r WearOS-Medication-Logger.apk', 'install')}
                      className="text-neutral-400 hover:text-white p-1"
                      title="Copy"
                    >
                      {copiedCmd === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Android Phone / Tablet */}
          {activeInstallTab === 'phone' && (
            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                Install Companion App on Android Phone:
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-300">
                <li>Download the APK file directly to your Android device using the button above.</li>
                <li>Tap the downloaded file in your browser or Downloads folder.</li>
                <li>If prompted, toggle <em>"Allow installation from this source"</em>.</li>
                <li>Tap <strong>Install</strong>. You now have the native Medication Logger app on your phone!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>Wear OS 3+ & Android 8.0+ compatible</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
