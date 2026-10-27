/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessTokenInMemory,
} from './services/auth';
import {
  findExistingSpreadsheet,
  createMedicationSpreadsheet,
  appendMedicationLog,
  fetchMedicationLogs,
} from './services/sheets';
import { Medication, MedicationLogEntry, SpreadsheetInfo, DeviceStyle, AppMode } from './types';
import { INITIAL_MEDICATIONS } from './data/defaultMedications';
import { WatchFace } from './components/WatchFace';
import { SmartwatchHardware } from './components/SmartwatchHardware';
import { CompanionWebApp } from './components/CompanionWebApp';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { feedback } from './services/audio';
import {
  Watch,
  Smartphone,
  LayoutGrid,
  FileSpreadsheet,
  Check,
  AlertCircle,
  ShieldCheck,
  BatteryCharging,
  Download,
} from 'lucide-react';

const STORAGE_KEY_MEDS = 'wearos_medication_list';
const STORAGE_KEY_ACTIVE_MED = 'wearos_active_med_id';
const STORAGE_KEY_SHEET_ID = 'wearos_sheet_id';
const STORAGE_KEY_APP_MODE = 'wearos_app_mode';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // App mode: 'companion' (when not wearing watch) | 'watch' (smartwatch only) | 'split' (side-by-side)
  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APP_MODE);
      if (saved === 'companion' || saved === 'watch' || saved === 'split') {
        return saved;
      }
    } catch (e) {}
    return 'companion'; // Default to companion webapp for when not wearing watch
  });

  // Predefined Medication list
  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MEDICATIONS;
  });

  // Selected active medication (for watch primary button)
  const [activeMedication, setActiveMedication] = useState<Medication>(() => {
    try {
      const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_MED);
      if (activeId) {
        const found = medications.find((m) => m.id === activeId);
        if (found) return found;
      }
    } catch (e) {}
    return medications[0] || INITIAL_MEDICATIONS[0];
  });

  // Spreadsheet state
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<SpreadsheetInfo | null>(null);
  const [isLoadingSpreadsheet, setIsLoadingSpreadsheet] = useState(false);
  const [recentLogs, setRecentLogs] = useState<MedicationLogEntry[]>([]);

  // Watch hardware emulator state
  const [deviceStyle, setDeviceStyle] = useState<DeviceStyle>('pixel');
  const [ambientMode, setAmbientMode] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(medications));
    } catch (e) {}
  }, [medications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_MED, activeMedication.id);
    } catch (e) {}
  }, [activeMedication]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APP_MODE, appMode);
    } catch (e) {}
  }, [appMode]);

  // Toast notification helper
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setStatusNotification({ message, type });
      setTimeout(() => {
        setStatusNotification((curr) => (curr?.message === message ? null : curr));
      }, 4000);
    },
    []
  );

  // Load or create spreadsheet for the logged in user
  const setupSpreadsheet = useCallback(
    async (token: string) => {
      setIsLoadingSpreadsheet(true);
      try {
        let sheet = await findExistingSpreadsheet(token);
        if (!sheet) {
          sheet = await createMedicationSpreadsheet(token);
          showToast('Created new "Wear OS Medication Log" spreadsheet in Google Sheets!', 'success');
        } else {
          showToast(`Connected to Google Sheet: "${sheet.name}"`, 'success');
        }
        setSpreadsheetInfo(sheet);
        try {
          localStorage.setItem(STORAGE_KEY_SHEET_ID, sheet.id);
        } catch (e) {}

        const logs = await fetchMedicationLogs(token, sheet.id, sheet.sheetName);
        setRecentLogs(logs);
      } catch (err: any) {
        console.error('Spreadsheet setup error:', err);
        showToast(
          `Google Sheets setup: ${err.message || 'Please check permissions'}`,
          'error'
        );
      } finally {
        setIsLoadingSpreadsheet(false);
      }
    },
    [showToast]
  );

  // Refresh logs from Google Sheets
  const handleRefreshSpreadsheet = useCallback(async () => {
    const token = accessToken || (await getAccessToken());
    if (!token || !spreadsheetInfo) return;

    setIsLoadingSpreadsheet(true);
    try {
      const logs = await fetchMedicationLogs(
        token,
        spreadsheetInfo.id,
        spreadsheetInfo.sheetName
      );
      setRecentLogs(logs);
      showToast('Spreadsheet rows refreshed from Google Sheets', 'success');
    } catch (err: any) {
      console.error('Refresh error:', err);
      showToast('Failed to refresh spreadsheet: ' + err.message, 'error');
    } finally {
      setIsLoadingSpreadsheet(false);
    }
  }, [accessToken, spreadsheetInfo, showToast]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setupSpreadsheet(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setupSpreadsheet]);

  // Google sign in
  const handleLogin = async () => {
    setIsLoggingIn(true);
    feedback.playTap();
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setAccessTokenInMemory(res.accessToken);
        showToast(`Signed in as ${res.user.displayName || res.user.email}`, 'success');
        await setupSpreadsheet(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(`Sign in error: ${err.message || 'Cancelled'}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    feedback.playTap();
    await logout();
    setUser(null);
    setAccessToken(null);
    setSpreadsheetInfo(null);
    showToast('Signed out of Google Workspace', 'info');
  };

  // Primary Action: Log medication dose (from either Wear OS or Companion Web App)
  const handleLogMedication = async (
    med: Medication = activeMedication,
    customTime?: string,
    notes?: string,
    source?: string
  ): Promise<boolean> => {
    const token = accessToken || (await getAccessToken());
    if (!token) {
      showToast('Please sign in with Google to record dose in spreadsheet', 'error');
      handleLogin();
      return false;
    }

    let currentSheet = spreadsheetInfo;
    setIsLogging(true);

    try {
      if (!currentSheet) {
        currentSheet = await findExistingSpreadsheet(token);
        if (!currentSheet) {
          currentSheet = await createMedicationSpreadsheet(token);
        }
        setSpreadsheetInfo(currentSheet);
      }

      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const timeToLog =
        customTime ||
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

      const previousDosesToday = recentLogs.filter(
        (l) => l.medicationName === med.name && l.date === formattedDate
      ).length;
      const doseNumberToday = previousDosesToday + 1;

      const deviceLabel = source || 'Wear OS Smartwatch';
      const noteLabel =
        notes ||
        (source?.includes('Companion')
          ? `Logged via Companion Web App (Watch Off-Wrist, Dose #${doseNumberToday})`
          : `Recorded via Wear OS 1-tap tile (Dose #${doseNumberToday})`);

      const logEntry: MedicationLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: now.toISOString(),
        date: formattedDate,
        time: timeToLog,
        medicationName: med.name,
        dosage: med.dosage,
        loggedVia: deviceLabel,
        notes: noteLabel,
        doseNumberToday,
      };

      // Optimistically update local logs
      setRecentLogs((prev) => [logEntry, ...prev]);

      // Append row to Google Sheets
      await appendMedicationLog(
        token,
        currentSheet.id,
        currentSheet.sheetName,
        logEntry
      );

      showToast(
        `✓ Logged ${med.name} (${med.dosage}) to Google Sheets!`,
        'success'
      );
      feedback.playSuccess();
      return true;
    } catch (err: any) {
      console.error('Failed to log dose:', err);
      showToast(
        `Failed to log to Google Sheets: ${err.message || 'Check network'}`,
        'error'
      );
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  // Add medication to predefined list
  const handleAddMedication = (newMed: Omit<Medication, 'id'>) => {
    const created: Medication = {
      ...newMed,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [...prev, created]);
    setActiveMedication(created);
    showToast(`Added "${created.name}" to predefined medication list!`, 'success');
    feedback.playSuccess();
  };

  // Delete medication from list
  const handleDeleteMedication = (id: string) => {
    if (medications.length <= 1) {
      showToast('You must keep at least one medication in the list.', 'error');
      return;
    }

    const medToDelete = medications.find((m) => m.id === id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (activeMedication.id === id) {
      const remaining = medications.filter((m) => m.id !== id);
      setActiveMedication(remaining[0]);
    }
    showToast(`Removed "${medToDelete?.name}" from list.`, 'info');
  };

  const todayDateStr = new Date().toISOString().split('T')[0];
  const activeMedTodayCount = recentLogs.filter(
    (l) => l.medicationName === activeMedication.name && l.date === todayDateStr
  ).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-neutral-900 rounded-[10px] flex items-center justify-center">
                {appMode === 'watch' ? (
                  <Watch className="w-5 h-5 text-sky-400" />
                ) : (
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  Medication Tracker
                </span>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Wear OS & Companion Web
                </span>
              </div>
              <span className="text-xs text-neutral-400 block -mt-0.5">
                Logs directly to Google Sheets whether wearing your watch or on the web
              </span>
            </div>
          </div>

          {/* Primary View Switcher: Companion Webapp vs Smartwatch vs Dual Split */}
          <div className="flex items-center gap-2.5">
            <div className="bg-neutral-800/90 p-1 rounded-xl border border-neutral-700/60 flex items-center gap-1 text-xs shadow-inner">
              <button
                onClick={() => {
                  setAppMode('companion');
                  feedback.playTap();
                }}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                  appMode === 'companion'
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Web companion when you are not wearing your watch"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Companion Webapp</span>
              </button>

              <button
                onClick={() => {
                  setAppMode('watch');
                  feedback.playTap();
                }}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                  appMode === 'watch'
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Smartwatch on-wrist tile view"
              >
                <Watch className="w-3.5 h-3.5" />
                <span>Wear OS Watch</span>
              </button>

              <button
                onClick={() => {
                  setAppMode('split');
                  feedback.playTap();
                }}
                className={`hidden md:flex px-3 py-1.5 rounded-lg transition font-medium items-center gap-1.5 ${
                  appMode === 'split'
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Side-by-side Watch + Companion view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Dual View</span>
              </button>
            </div>

            <button
              onClick={() => setIsApkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-emerald-500/20 hover:from-sky-500/30 hover:to-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm transition active:scale-95"
              title="Download Wear OS & Android APK"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download APK</span>
            </button>

            {spreadsheetInfo && (
              <a
                href={spreadsheetInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Open Sheet
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification Alert */}
      {statusNotification && (
        <div className="fixed top-16 right-4 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium border ${
              statusNotification.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-700/80'
                : statusNotification.type === 'error'
                ? 'bg-rose-950/95 text-rose-200 border-rose-700/80'
                : 'bg-neutral-900/95 text-neutral-200 border-neutral-700'
            }`}
          >
            {statusNotification.type === 'success' && (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {statusNotification.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusNotification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col">
        {/* MODE 1: COMPANION WEB APP (When user is not wearing watch) */}
        {appMode === 'companion' && (
          <div className="max-w-4xl mx-auto w-full">
            <CompanionWebApp
              user={user}
              isAuthenticated={!!user}
              onLogin={handleLogin}
              onLogout={handleLogout}
              isLoggingIn={isLoggingIn}
              spreadsheetInfo={spreadsheetInfo}
              onRefreshSpreadsheet={handleRefreshSpreadsheet}
              isLoadingSpreadsheet={isLoadingSpreadsheet}
              medications={medications}
              activeMedication={activeMedication}
              onSelectActiveMedication={(med) => {
                setActiveMedication(med);
                showToast(`Set "${med.name}" as watch primary button`, 'info');
              }}
              onAddMedication={handleAddMedication}
              onDeleteMedication={handleDeleteMedication}
              recentLogs={recentLogs}
              onLogDose={(med, customTime, notes, source) =>
                handleLogMedication(med, customTime, notes, source)
              }
              isLogging={isLogging}
              onSwitchToWatch={() => setAppMode('watch')}
              onOpenApkModal={() => setIsApkModalOpen(true)}
            />
          </div>
        )}

        {/* MODE 2: WEAR OS SMARTWATCH ONLY */}
        {appMode === 'watch' && (
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="mb-4 text-center">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Wear OS Smartwatch Simulator
              </span>
              <p className="text-xs text-neutral-500 mt-0.5">
                Select your medicine from the predefined chips, then press the big button to log.
              </p>
            </div>

            <SmartwatchHardware
              deviceStyle={deviceStyle}
              onChangeDeviceStyle={setDeviceStyle}
              onSideButtonClick={() => handleLogMedication(activeMedication)}
              onCrownRotate={(dir) => feedback.playRotary()}
              ambientMode={ambientMode}
              onToggleAmbient={() => setAmbientMode(!ambientMode)}
            >
              <WatchFace
                activeMedication={activeMedication}
                allMedications={medications}
                onSelectActiveMedication={(med) => {
                  setActiveMedication(med);
                  showToast(`Selected "${med.name} (${med.dosage})" on watch`, 'info');
                }}
                onLogMedication={(med, notes) =>
                  handleLogMedication(med, undefined, notes, 'Wear OS Smartwatch')
                }
                isLogging={isLogging}
                lastLoggedTime={recentLogs[0]?.time || null}
                todayLogCount={activeMedTodayCount}
                recentLogs={recentLogs}
                spreadsheetInfo={spreadsheetInfo}
                isAuthenticated={!!user}
                onRequireAuth={handleLogin}
                ambientMode={ambientMode}
                onToggleAmbient={() => setAmbientMode(!ambientMode)}
              />
            </SmartwatchHardware>

            <button
              onClick={() => setAppMode('companion')}
              className="mt-6 text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Not wearing watch? Open Companion Web App
            </button>
          </div>
        )}

        {/* MODE 3: DUAL SPLIT VIEW (Watch on left, Companion on right) */}
        {appMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Smartwatch Hardware (Left) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Watch className="w-4 h-4 text-sky-400" />
                  Wear OS Watch
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Live Sync
                </span>
              </div>

              <SmartwatchHardware
                deviceStyle={deviceStyle}
                onChangeDeviceStyle={setDeviceStyle}
                onSideButtonClick={() => handleLogMedication(activeMedication)}
                onCrownRotate={(dir) => feedback.playRotary()}
                ambientMode={ambientMode}
                onToggleAmbient={() => setAmbientMode(!ambientMode)}
              >
                <WatchFace
                  activeMedication={activeMedication}
                  allMedications={medications}
                  onSelectActiveMedication={(med) => {
                    setActiveMedication(med);
                    showToast(`Selected "${med.name}" on watch`, 'info');
                  }}
                  onLogMedication={(med, notes) =>
                    handleLogMedication(med, undefined, notes, 'Wear OS Smartwatch')
                  }
                  isLogging={isLogging}
                  lastLoggedTime={recentLogs[0]?.time || null}
                  todayLogCount={activeMedTodayCount}
                  recentLogs={recentLogs}
                  spreadsheetInfo={spreadsheetInfo}
                  isAuthenticated={!!user}
                  onRequireAuth={handleLogin}
                  ambientMode={ambientMode}
                  onToggleAmbient={() => setAmbientMode(!ambientMode)}
                />
              </SmartwatchHardware>
            </div>

            {/* Companion Web App (Right) */}
            <div className="lg:col-span-7">
              <CompanionWebApp
                user={user}
                isAuthenticated={!!user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                isLoggingIn={isLoggingIn}
                spreadsheetInfo={spreadsheetInfo}
                onRefreshSpreadsheet={handleRefreshSpreadsheet}
                isLoadingSpreadsheet={isLoadingSpreadsheet}
                medications={medications}
                activeMedication={activeMedication}
                onSelectActiveMedication={setActiveMedication}
                onAddMedication={handleAddMedication}
                onDeleteMedication={handleDeleteMedication}
                recentLogs={recentLogs}
                onLogDose={(med, customTime, notes, source) =>
                  handleLogMedication(med, customTime, notes, source)
                }
                isLogging={isLogging}
                onSwitchToWatch={() => setAppMode('watch')}
                onOpenApkModal={() => setIsApkModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-4 px-6 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>
          Medication Logger • Wear OS Smartwatch & Companion Web App • Google Sheets Connected
        </span>
        <button
          onClick={() => setIsApkModalOpen(true)}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Download Android APK (~197 KB)
        </button>
      </footer>

      {/* APK Download & Sideloading Instructions Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
