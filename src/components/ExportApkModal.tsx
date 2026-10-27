import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Smartphone,
  Watch,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ExportApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const ExportApkModal: React.FC<ExportApkModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'capacitor' | 'bubblewrap' | 'native'>('capacitor');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Export to Android & Wear OS APK
              </h3>
              <p className="text-xs text-neutral-400">
                Package this web application into a standalone APK for your smartwatch or phone
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

        {/* Method selector tabs */}
        <div className="px-5 pt-4 flex items-center gap-2 border-b border-neutral-800/80 bg-neutral-950/40">
          <button
            onClick={() => setSelectedMethod('capacitor')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              selectedMethod === 'capacitor'
                ? 'border-sky-500 text-sky-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Capacitor (Recommended)
          </button>

          <button
            onClick={() => setSelectedMethod('bubblewrap')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              selectedMethod === 'bubblewrap'
                ? 'border-sky-500 text-sky-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Google Bubblewrap CLI
          </button>

          <button
            onClick={() => setSelectedMethod('native')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              selectedMethod === 'native'
                ? 'border-sky-500 text-sky-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Watch className="w-3.5 h-3.5" />
            Wear OS Sideloading (ADB)
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-300">
          {/* METHOD 1: CAPACITOR */}
          {selectedMethod === 'capacitor' && (
            <div className="space-y-4">
              <div className="bg-sky-950/30 border border-sky-800/50 rounded-xl p-3 text-sky-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Capacitor</strong> wraps this React/Vite app into a native Android project with an APK output in just 3 terminal commands.
                </span>
              </div>

              {/* Step 1 */}
              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-sky-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Install Capacitor CLI & Android platform
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>npm install @capacitor/core @capacitor/cli @capacitor/android</code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm install @capacitor/core @capacitor/cli @capacitor/android',
                        1
                      )
                    }
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 1 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-sky-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  Build the web assets & add Android platform
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>npm run build && npx cap add android</code>
                  <button
                    onClick={() =>
                      copyToClipboard('npm run build && npx cap add android', 2)
                    }
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 2 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-sky-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  Open in Android Studio & Generate APK
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>npx cap open android</code>
                  <button
                    onClick={() => copyToClipboard('npx cap open android', 3)}
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 3 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Inside Android Studio, simply click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>. The compiled <code>.apk</code> file will be placed in <code>android/app/build/outputs/apk/debug/app-debug.apk</code>.
                </p>
              </div>

              {/* Wear OS Manifest Tweak */}
              <div className="bg-neutral-800/40 border border-neutral-800 rounded-xl p-3">
                <span className="font-semibold text-white text-xs block mb-1">
                  Wear OS Specific Flag (Optional for Watch APK):
                </span>
                <p className="text-[11px] text-neutral-400 mb-2">
                  In <code>android/app/src/main/AndroidManifest.xml</code>, declare smartwatch hardware support:
                </p>
                <div className="bg-neutral-950 p-2 rounded font-mono text-[10px] text-sky-300">
                  &lt;uses-feature android:name="android.hardware.type.watch" /&gt;
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: BUBBLEWRAP CLI */}
          {selectedMethod === 'bubblewrap' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 text-emerald-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Bubblewrap</strong> is Google's official command-line tool that turns any hosted Progressive Web App into a production-ready Android APK / AAB.
                </span>
              </div>

              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Install Bubblewrap globally
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>npm i -g @bubblewrap/cli</code>
                  <button
                    onClick={() => copyToClipboard('npm i -g @bubblewrap/cli', 4)}
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 4 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  Initialize project from your manifest
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>{`bubblewrap init --manifest ${appUrl}/manifest.json`}</code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `bubblewrap init --manifest ${appUrl}/manifest.json`,
                        5
                      )
                    }
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 5 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  Build signed APK
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>bubblewrap build</code>
                  <button
                    onClick={() => copyToClipboard('bubblewrap build', 6)}
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 6 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Generates <code>app-release-signed.apk</code> ready to install or upload to the Google Play Store!
                </p>
              </div>
            </div>
          )}

          {/* METHOD 3: SIDELOADING TO WEAR OS */}
          {selectedMethod === 'native' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 text-amber-200 flex items-start gap-2.5">
                <Watch className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Install APK to your Wear OS Watch (Pixel Watch, Galaxy Watch, etc.)</strong> over Wireless ADB without needing any cables.
                </span>
              </div>

              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Enable Wireless Debugging on your Watch
                </div>
                <p className="text-[11px] text-neutral-400 mb-1">
                  On your watch, go to <strong>Settings &gt; System &gt; About &gt; Tap "Build number" 7 times</strong> to enable Developer Options. Then in <strong>Developer options</strong>, turn on <strong>Wireless debugging</strong>.
                </p>
              </div>

              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  Connect ADB to your watch IP
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>adb connect 192.168.1.XX:5555</code>
                  <button
                    onClick={() =>
                      copyToClipboard('adb connect 192.168.1.XX:5555', 7)
                    }
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 7 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  Install APK directly onto your watch
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between font-mono text-[11px] text-neutral-300">
                  <code>adb install app-debug.apk</code>
                  <button
                    onClick={() => copyToClipboard('adb install app-debug.apk', 8)}
                    className="p-1 hover:text-white transition text-neutral-400"
                  >
                    {copiedIndex === 8 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                  ✓ The app is now installed on your wrist and will appear in your Wear OS app drawer!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Works with Pixel Watch 1/2/3, Samsung Galaxy Watch 4/5/6/7, and Android phones.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
