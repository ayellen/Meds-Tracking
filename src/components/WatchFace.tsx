import React, { useState, useEffect } from 'react';
import {
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronRight,
  ListFilter,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Vibrate,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Pill,
  SlidersHorizontal,
  PlusCircle,
  History,
} from 'lucide-react';
import { Medication, MedicationLogEntry, WatchScreen, SpreadsheetInfo } from '../types';
import { feedback } from '../services/audio';

interface WatchFaceProps {
  activeMedication: Medication;
  allMedications: Medication[];
  onSelectActiveMedication: (med: Medication) => void;
  onLogMedication: (med: Medication, notes?: string) => Promise<boolean>;
  isLogging: boolean;
  lastLoggedTime: string | null;
  todayLogCount: number;
  recentLogs: MedicationLogEntry[];
  spreadsheetInfo: SpreadsheetInfo | null;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  ambientMode: boolean;
  onToggleAmbient: () => void;
}

export const WatchFace: React.FC<WatchFaceProps> = ({
  activeMedication,
  allMedications,
  onSelectActiveMedication,
  onLogMedication,
  isLogging,
  lastLoggedTime,
  todayLogCount,
  recentLogs,
  spreadsheetInfo,
  isAuthenticated,
  onRequireAuth,
  ambientMode,
  onToggleAmbient,
}) => {
  const [currentScreen, setCurrentScreen] = useState<WatchScreen>('quick-log');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [successCelebration, setSuccessCelebration] = useState(false);
  const [lastLoggedMedName, setLastLoggedMedName] = useState<string>('');
  const [soundActive, setSoundActive] = useState(true);
  const [hapticActive, setHapticActive] = useState(true);
  const [batteryLevel] = useState(88);
  const [showSelectorModal, setShowSelectorModal] = useState(false);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter logs for currently selected medicine today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const activeMedTodayLogs = recentLogs.filter(
    (l) => l.medicationName === activeMedication.name && l.date === todayDateStr
  );
  const activeMedDoseCount = activeMedTodayLogs.length;

  const handleLogClick = async (med: Medication = activeMedication) => {
    if (!isAuthenticated) {
      feedback.playTap();
      onRequireAuth();
      return;
    }

    feedback.playTap();
    setLastLoggedMedName(med.name);
    const success = await onLogMedication(med);
    if (success) {
      setSuccessCelebration(true);
      feedback.playSuccess();
      setTimeout(() => {
        setSuccessCelebration(false);
      }, 2800);
    }
  };

  const navigateTo = (screen: WatchScreen) => {
    feedback.playRotary();
    setShowSelectorModal(false);
    setCurrentScreen(screen);
  };

  // Ambient Always-On Display Mode (Minimal power-saving watch face)
  if (ambientMode) {
    return (
      <div
        onClick={onToggleAmbient}
        className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center p-6 text-neutral-400 select-none cursor-pointer transition-colors duration-500"
      >
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
          Wear OS Ambient
        </span>
        <div className="text-4xl font-light text-neutral-200 my-2 font-mono">
          {currentTime || '10:45'}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
          <Pill className="w-3.5 h-3.5 text-neutral-500" />
          <span className="font-semibold">{activeMedication.name}</span>
          <span className="text-neutral-500 text-[11px]">({activeMedication.dosage})</span>
        </div>
        <div className="text-[10px] text-neutral-500 mt-3 font-mono">
          {activeMedDoseCount > 0 ? `✓ ${activeMedDoseCount} taken today` : 'Tap to wake & log'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-full bg-black text-white relative flex flex-col items-center justify-between overflow-hidden p-3 select-none">
      {/* Top Status Bar (Curved Wear OS Header) */}
      <div className="w-full pt-2 px-8 flex items-center justify-between text-[11px] font-medium text-neutral-300 z-20">
        <span className="font-mono tracking-tight">{currentTime}</span>

        {/* Sync / Cloud Status Indicator */}
        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <span
              title="Connected to Google Sheets"
              className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sheets
            </span>
          ) : (
            <button
              onClick={onRequireAuth}
              className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-500/30"
            >
              <AlertCircle className="w-2.5 h-2.5" />
              Sign in
            </button>
          )}

          <span className="text-[10px] text-neutral-400 font-mono">{batteryLevel}%</span>
        </div>
      </div>

      {/* Main Screen: Quick Log with Integrated Medicine Selector */}
      {currentScreen === 'quick-log' && (
        <div className="w-full flex-1 flex flex-col items-center justify-center px-3 relative z-10 text-center">
          {successCelebration ? (
            /* Success Feedback Overlay */
            <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-300 px-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2"
                style={{ backgroundColor: activeMedication.color }}
              >
                <Check className="w-9 h-9 text-black stroke-[3.5]" />
              </div>
              <div className="text-sm font-bold text-emerald-400">
                Logged to Sheets!
              </div>
              <div className="text-xs font-semibold text-white mt-0.5">
                {lastLoggedMedName || activeMedication.name}
              </div>
              <div className="text-[11px] text-neutral-300">
                {activeMedication.dosage}
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-1 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                Row appended in spreadsheet
              </div>
            </div>
          ) : (
            /* Medicine Selector + Prominent Log Button */
            <>
              {/* Step 1: Predefined Medicine Selector Chips */}
              <div className="w-full mb-1 flex flex-col items-center">
                <div className="flex items-center justify-between w-full px-4 mb-1">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                    1. Select Medicine:
                  </span>
                  <button
                    onClick={() => navigateTo('med-select')}
                    className="text-[9px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5"
                  >
                    View All ({allMedications.length})
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Horizontal Quick-Select Carousel of Predefined Medicines */}
                <div className="w-full max-w-[280px] flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none justify-center">
                  {allMedications.slice(0, 4).map((med) => {
                    const isSelected = med.id === activeMedication.id;
                    return (
                      <button
                        key={med.id}
                        onClick={() => {
                          feedback.playTap();
                          onSelectActiveMedication(med);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all shrink-0 active:scale-95 ${
                          isSelected
                            ? 'text-black shadow-md font-bold ring-2 ring-white/50'
                            : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700/80 border border-neutral-700/50'
                        }`}
                        style={{
                          backgroundColor: isSelected ? med.color : undefined,
                        }}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-black' : ''
                          }`}
                          style={{
                            backgroundColor: isSelected ? '#000000' : med.color,
                          }}
                        />
                        <span className="truncate max-w-[62px]">{med.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Selection Details */}
              <div className="my-0.5 text-center">
                <span className="text-[10px] text-neutral-400">
                  Selected: <strong className="text-white">{activeMedication.name}</strong> ({activeMedication.dosage})
                </span>
              </div>

              {/* Step 2: The Wear OS Log Button */}
              <div className="my-1">
                <button
                  onClick={() => handleLogClick(activeMedication)}
                  disabled={isLogging}
                  className="group relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:scale-90 active:brightness-125 focus:outline-none shadow-2xl"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${activeMedication.color}dd, ${activeMedication.color}77 70%, #000000 100%)`,
                    boxShadow: `0 0 24px ${activeMedication.color}44`,
                    border: `2px solid ${activeMedication.color}aa`,
                  }}
                  title={`Log ${activeMedication.name} to spreadsheet`}
                >
                  {/* Glowing ripple ring */}
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                    style={{ backgroundColor: activeMedication.color }}
                  />

                  {isLogging ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white">
                        Logging...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Pill className="w-6 h-6 text-white drop-shadow-md mb-0.5 stroke-[2.4] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black tracking-wide uppercase text-white drop-shadow-sm px-1 truncate max-w-[90px]">
                        LOG DOSE
                      </span>
                      <span className="text-[9px] text-white/90 font-semibold truncate max-w-[85px]">
                        {activeMedication.name}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Status info under button */}
              <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1.5">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>
                  {activeMedDoseCount > 0
                    ? `Taken today: ${activeMedDoseCount} / ${activeMedication.targetDailyDose}`
                    : `Goal: ${activeMedication.targetDailyDose}x daily`}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Screen 2: Predefined Medicine Selector List (Full Screen Picker) */}
      {currentScreen === 'med-select' && (
        <div className="w-full flex-1 flex flex-col items-center overflow-y-auto px-4 pt-1 pb-3 text-left scrollbar-none z-10">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center w-full mb-1">
            Predefined Medicines
          </div>
          <div className="w-full space-y-1.5">
            {allMedications.map((med) => {
              const isSelected = med.id === activeMedication.id;
              const todayCount = recentLogs.filter(
                (l) => l.medicationName === med.name && l.date === todayDateStr
              ).length;

              return (
                <div
                  key={med.id}
                  className={`w-full p-2 rounded-2xl flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-neutral-800/90 border border-neutral-500 shadow-md ring-1 ring-white/20'
                      : 'bg-neutral-900/80 hover:bg-neutral-800/60 border border-neutral-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      feedback.playTap();
                      onSelectActiveMedication(med);
                      navigateTo('quick-log');
                    }}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-black font-bold shrink-0 shadow-sm"
                      style={{ backgroundColor: med.color }}
                    >
                      <Pill className="w-4 h-4 text-black" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white flex items-center gap-1 truncate">
                        <span>{med.name}</span>
                        {isSelected && (
                          <span className="text-[9px] bg-white/20 px-1 rounded text-white font-normal">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {med.dosage} • {todayCount > 0 ? `✓ ${todayCount} today` : med.schedule || 'Daily'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectActiveMedication(med);
                      handleLogClick(med);
                    }}
                    disabled={isLogging}
                    title={`Log ${med.name} now`}
                    className="ml-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 transition-transform active:scale-90 shadow"
                    style={{ backgroundColor: med.color, color: '#000000' }}
                  >
                    Log
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigateTo('quick-log')}
            className="mt-2 text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Quick Log
          </button>
        </div>
      )}

      {/* Screen 3: Wrist Log History Screen */}
      {currentScreen === 'history' && (
        <div className="w-full flex-1 flex flex-col items-center overflow-y-auto px-4 pt-1 pb-3 text-left scrollbar-none z-10">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center w-full mb-1">
            Spreadsheet Log ({recentLogs.length})
          </div>

          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
              <Clock className="w-6 h-6 text-neutral-600 mb-1.5" />
              <div className="text-xs text-neutral-300 font-medium">No logged doses yet</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                Select a medicine and tap the big button to record to your spreadsheet!
              </div>
            </div>
          ) : (
            <div className="w-full space-y-1.5">
              {recentLogs.slice(0, 5).map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-2 text-xs"
                >
                  <div className="flex items-center justify-between text-white font-semibold">
                    <span className="truncate">{log.medicationName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {log.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5">
                    <span>{log.dosage}</span>
                    <span className="text-neutral-500 font-mono text-[9px]">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigateTo('quick-log')}
            className="mt-2 text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Log Tile
          </button>
        </div>
      )}

      {/* Screen 4: Watch Settings Screen */}
      {currentScreen === 'settings' && (
        <div className="w-full flex-1 flex flex-col items-center overflow-y-auto px-4 pt-1 pb-3 text-left scrollbar-none z-10">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center w-full mb-2">
            Watch Settings
          </div>
          <div className="w-full space-y-1.5">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                feedback.soundEnabled = !soundActive;
                setSoundActive(!soundActive);
                feedback.playTap();
              }}
              className="w-full p-2 bg-neutral-900 rounded-xl flex items-center justify-between text-xs border border-neutral-800"
            >
              <div className="flex items-center gap-2 text-neutral-200">
                {soundActive ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                )}
                <span className="text-[11px]">Sound Effects</span>
              </div>
              <span
                className={`text-[10px] font-bold ${
                  soundActive ? 'text-emerald-400' : 'text-neutral-500'
                }`}
              >
                {soundActive ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Haptic Toggle */}
            <button
              onClick={() => {
                feedback.hapticEnabled = !hapticActive;
                setHapticActive(!hapticActive);
                feedback.playTap();
              }}
              className="w-full p-2 bg-neutral-900 rounded-xl flex items-center justify-between text-xs border border-neutral-800"
            >
              <div className="flex items-center gap-2 text-neutral-200">
                <Vibrate className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px]">Haptic Buzz</span>
              </div>
              <span
                className={`text-[10px] font-bold ${
                  hapticActive ? 'text-sky-400' : 'text-neutral-500'
                }`}
              >
                {hapticActive ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Ambient Mode */}
            <button
              onClick={() => {
                feedback.playTap();
                onToggleAmbient();
              }}
              className="w-full p-2 bg-neutral-900 rounded-xl flex items-center justify-between text-xs border border-neutral-800 text-neutral-200"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Always-On Mode</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Test</span>
            </button>

            {/* Google Sheets Link */}
            {spreadsheetInfo && (
              <a
                href={spreadsheetInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs text-emerald-300"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] truncate">Open Google Sheet</span>
                </div>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation Dots & Carousel */}
      <div className="w-full pb-1 px-6 flex items-center justify-between text-neutral-400 z-20">
        <button
          onClick={() => {
            const screens: WatchScreen[] = ['quick-log', 'med-select', 'history', 'settings'];
            const currentIndex = screens.indexOf(currentScreen);
            const prevIndex = (currentIndex - 1 + screens.length) % screens.length;
            navigateTo(screens[prevIndex]);
          }}
          className="p-1 rounded-full hover:bg-neutral-800 transition active:scale-90"
          title="Previous Tile"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        {/* Carousel indicator dots */}
        <div className="flex items-center gap-1.5">
          {(['quick-log', 'med-select', 'history', 'settings'] as WatchScreen[]).map((scr) => (
            <button
              key={scr}
              onClick={() => navigateTo(scr)}
              className={`transition-all rounded-full ${
                currentScreen === scr
                  ? 'w-4 h-1 bg-white'
                  : 'w-1 h-1 bg-neutral-600 hover:bg-neutral-500'
              }`}
              title={scr}
            />
          ))}
        </div>

        <button
          onClick={() => {
            const screens: WatchScreen[] = ['quick-log', 'med-select', 'history', 'settings'];
            const currentIndex = screens.indexOf(currentScreen);
            const nextIndex = (currentIndex + 1) % screens.length;
            navigateTo(screens[nextIndex]);
          }}
          className="p-1 rounded-full hover:bg-neutral-800 transition active:scale-90"
          title="Next Tile"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
