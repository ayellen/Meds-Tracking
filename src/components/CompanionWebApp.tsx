import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  LogOut,
  Pill,
  Watch,
  Smartphone,
  BatteryCharging,
  Sun,
  Moon,
  Sunset,
  Coffee,
  Check,
  Search,
  SlidersHorizontal,
  ChevronRight,
  SendHorizontal,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Medication, MedicationLogEntry, SpreadsheetInfo } from '../types';
import { feedback } from '../services/audio';

interface CompanionWebAppProps {
  user: User | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  spreadsheetInfo: SpreadsheetInfo | null;
  onRefreshSpreadsheet: () => void;
  isLoadingSpreadsheet: boolean;
  medications: Medication[];
  activeMedication: Medication;
  onSelectActiveMedication: (med: Medication) => void;
  onAddMedication: (med: Omit<Medication, 'id'>) => void;
  onDeleteMedication: (id: string) => void;
  recentLogs: MedicationLogEntry[];
  onLogDose: (
    med: Medication,
    customTime?: string,
    notes?: string,
    source?: string
  ) => Promise<boolean>;
  isLogging: boolean;
  onSwitchToWatch: () => void;
}

export const CompanionWebApp: React.FC<CompanionWebAppProps> = ({
  user,
  isAuthenticated,
  onLogin,
  onLogout,
  isLoggingIn,
  spreadsheetInfo,
  onRefreshSpreadsheet,
  isLoadingSpreadsheet,
  medications,
  activeMedication,
  onSelectActiveMedication,
  onAddMedication,
  onDeleteMedication,
  recentLogs,
  onLogDose,
  isLogging,
  onSwitchToWatch,
}) => {
  // UI Tabs inside companion
  const [activeTab, setActiveTab] = useState<'log' | 'schedule' | 'sheet' | 'meds'>('log');

  // Filter & search for sheet logs
  const [filterMedName, setFilterMedName] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom log modal for logging earlier doses or with notes
  const [customLogMed, setCustomLogMed] = useState<Medication | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Add medication modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedColor, setNewMedColor] = useState('#38bdf8');
  const [newMedTimeOfDay, setNewMedTimeOfDay] = useState<
    'morning' | 'afternoon' | 'evening' | 'bedtime' | 'prn'
  >('morning');
  const [newMedSchedule, setNewMedSchedule] = useState('');
  const [newMedTargetDose, setNewMedTargetDose] = useState(1);
  const [newMedInstructions, setNewMedInstructions] = useState('');

  // Today's date string
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Calculate today's adherence stats
  const todayLogs = recentLogs.filter((l) => l.date === todayDateStr);
  const totalTargetDoses = medications.reduce(
    (sum, m) => sum + (m.targetDailyDose || 1),
    0
  );
  const adherencePercent =
    totalTargetDoses > 0
      ? Math.min(100, Math.round((todayLogs.length / totalTargetDoses) * 100))
      : 100;

  // Handle instant 1-tap logging from companion webapp
  const handleQuickLog = async (med: Medication) => {
    feedback.playTap();
    await onLogDose(
      med,
      undefined,
      'Logged via Companion Web App (Watch off-wrist)',
      'Companion Web App'
    );
  };

  // Handle custom dose log (e.g. earlier time or custom notes)
  const handleCustomLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLogMed) return;
    feedback.playTap();

    await onLogDose(
      customLogMed,
      customTime.trim() || undefined,
      customNotes.trim() || 'Logged via Companion Web App',
      'Companion Web App (Manual Entry)'
    );

    setCustomLogMed(null);
    setCustomTime('');
    setCustomNotes('');
  };

  // Handle adding a new medicine to predefined list
  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    onAddMedication({
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      color: newMedColor,
      icon: 'pill',
      timeOfDay: newMedTimeOfDay,
      schedule: newMedSchedule.trim() || `${newMedTimeOfDay.toUpperCase()} dose`,
      instructions: newMedInstructions.trim() || 'Take as prescribed',
      targetDailyDose: Number(newMedTargetDose) || 1,
    });

    setNewMedName('');
    setNewMedDosage('');
    setNewMedSchedule('');
    setNewMedInstructions('');
    setShowAddModal(false);
  };

  // Filtered spreadsheet rows
  const filteredLogs = recentLogs.filter((l) => {
    const matchesMed =
      filterMedName === 'all' || l.medicationName === filterMedName;
    const matchesSearch =
      searchQuery === '' ||
      l.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.date.includes(searchQuery) ||
      l.loggedVia.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMed && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col space-y-6 text-neutral-100">
      {/* Off-Wrist Banner & Smartwatch Status Notice */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-sky-950/40 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Companion Web App
                </h2>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Watch Not Worn Mode
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Log doses when your watch is charging, at your desk, or left behind. Everything syncs directly to the same Google Sheet.
              </p>
            </div>
          </div>

          {/* Quick status pill & switch to watch button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-neutral-700/60 text-xs">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-neutral-400 text-[10px] block leading-none">
                  Smartwatch Status
                </span>
                <span className="text-neutral-200 font-semibold text-[11px] leading-tight">
                  Charging (88%)
                </span>
              </div>
            </div>

            <button
              onClick={onSwitchToWatch}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              title="Open smartwatch simulator view"
            >
              <Watch className="w-3.5 h-3.5 text-sky-400" />
              Switch to Watch
            </button>
          </div>
        </div>

        {/* Google Workspace & Spreadsheet Sync Info Bar */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-400">Connected Sheet:</span>
            {spreadsheetInfo ? (
              <a
                href={spreadsheetInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-medium hover:underline flex items-center gap-1"
              >
                {spreadsheetInfo.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-amber-400">Connecting Google Sheets...</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="text-[11px] text-neutral-400">Account:</span>
                <span className="font-medium text-white truncate max-w-[140px]">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={onLogout}
                  className="text-neutral-400 hover:text-rose-400 ml-1 p-1"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 text-neutral-900 rounded-lg font-semibold text-xs transition"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('log')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'log'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Pill className="w-4 h-4" />
          Log Medication Now
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'schedule'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Today's Schedule & Adherence
          <span className="bg-neutral-800 text-neutral-200 px-1.5 py-0.2 rounded-full text-[10px]">
            {todayLogs.length}/{totalTargetDoses}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sheet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'sheet'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Live Google Sheet Rows
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded-full text-[10px]">
            {recentLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('meds')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'meds'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Manage Predefined List
        </button>
      </div>

      {/* TAB 1: ONE-TAP LOG MEDICATION NOW (When not wearing watch) */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-sky-400" />
                Select & Record a Dose
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tap <strong>"Log Now"</strong> to write to Google Sheets immediately, or use <strong>"Custom Time"</strong> if you took it earlier while away from your watch.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 border border-neutral-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medicine
            </button>
          </div>

          {/* Cards for each predefined medicine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const medTodayLogs = recentLogs.filter(
                (l) => l.medicationName === med.name && l.date === todayDateStr
              );
              const takenTodayCount = medTodayLogs.length;
              const isGoalMet = takenTodayCount >= med.targetDailyDose;

              return (
                <div
                  key={med.id}
                  className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Accent strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: med.color }}
                  />

                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-black shadow-md shrink-0"
                          style={{ backgroundColor: med.color }}
                        >
                          <Pill className="w-6 h-6 text-black stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white tracking-tight">
                              {med.name}
                            </h4>
                            {isGoalMet && (
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-semibold px-2 py-0.2 rounded-full flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                Daily Goal Met
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 font-medium">
                            {med.dosage} • {med.schedule || 'Scheduled'}
                          </div>
                        </div>
                      </div>

                      {/* Today's count pill */}
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-neutral-400">
                          Today: <strong className="text-white">{takenTodayCount}</strong>/{med.targetDailyDose}
                        </span>
                      </div>
                    </div>

                    {/* Instructions */}
                    {med.instructions && (
                      <div className="mt-3 text-xs text-neutral-400 bg-neutral-800/50 p-2 rounded-xl border border-neutral-800">
                        <span className="text-neutral-500 font-semibold mr-1">Instructions:</span>
                        {med.instructions}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCustomLogMed(med);
                          const now = new Date();
                          setCustomTime(
                            now.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          );
                        }}
                        className="text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 transition"
                      >
                        Custom Time / Notes
                      </button>

                      <button
                        onClick={() => {
                          onSelectActiveMedication(med);
                          feedback.playTap();
                        }}
                        title="Set this medication as active on your Wear OS watch face"
                        className="text-xs text-sky-400 hover:text-sky-300 px-2 py-1.5 rounded-lg hover:bg-sky-950/40 transition flex items-center gap-1"
                      >
                        <SendHorizontal className="w-3 h-3" />
                        Send to Watch
                      </button>
                    </div>

                    {/* Main big button for Companion webapp */}
                    <button
                      onClick={() => handleQuickLog(med)}
                      disabled={isLogging}
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide text-black transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      style={{ backgroundColor: med.color }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Log Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TODAY'S SCHEDULE & ADHERENCE TIMELINE */}
      {activeTab === 'schedule' && (
        <div className="space-y-5">
          {/* Adherence Banner */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Daily Adherence Overview
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {todayLogs.length} of {totalTargetDoses} doses logged today
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Keep consistent tracking whether wearing your watch or logging from the web companion.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-neutral-800 flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-emerald-400"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% ${adherencePercent}%, 0 ${adherencePercent}%)`,
                    }}
                  />
                  <span className="text-sm font-bold text-white">
                    {adherencePercent}%
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1">Goal Adherence</span>
              </div>
            </div>
          </div>

          {/* Time of Day Timeline Groups */}
          <div className="space-y-4">
            {(
              [
                { id: 'morning', label: 'Morning', icon: Coffee, desc: '6:00 AM - 11:00 AM' },
                { id: 'afternoon', label: 'Afternoon', icon: Sun, desc: '11:00 AM - 4:00 PM' },
                { id: 'evening', label: 'Evening', icon: Sunset, desc: '4:00 PM - 9:00 PM' },
                { id: 'bedtime', label: 'Bedtime', icon: Moon, desc: '9:00 PM - Midnight' },
              ] as const
            ).map((slot) => {
              const medsInSlot = medications.filter(
                (m) => (m.timeOfDay || 'morning') === slot.id
              );
              const SlotIcon = slot.icon;

              if (medsInSlot.length === 0) return null;

              return (
                <div
                  key={slot.id}
                  className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-md"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
                        <SlotIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm">
                          {slot.label}
                        </span>
                        <span className="text-[11px] text-neutral-400 ml-2 font-mono">
                          {slot.desc}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {medsInSlot.map((med) => {
                      const doseToday = todayLogs.filter(
                        (l) => l.medicationName === med.name
                      );
                      const isTaken = doseToday.length > 0;

                      return (
                        <div
                          key={med.id}
                          className="flex items-center justify-between bg-neutral-800/40 hover:bg-neutral-800/70 p-3 rounded-xl border border-neutral-800 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: med.color }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-xs">
                                  {med.name}
                                </span>
                                <span className="text-[11px] text-neutral-400">
                                  {med.dosage}
                                </span>
                              </div>
                              <span className="text-[10px] text-neutral-500">
                                {med.schedule || 'Scheduled'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isTaken ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Taken ({doseToday[0].time})</span>
                                <span className="text-[10px] text-neutral-400 ml-1">
                                  {doseToday[0].loggedVia.includes('Wear OS')
                                    ? '⌚ Watch'
                                    : '📱 Web'}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickLog(med)}
                                disabled={isLogging}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-black transition active:scale-95"
                                style={{ backgroundColor: med.color }}
                              >
                                Mark Taken
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SPREADSHEET ROWS */}
      {activeTab === 'sheet' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Google Sheets Medication Records ({recentLogs.length})
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Every entry from both your Wear OS watch and this companion web app is stored in the sheet.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefreshSpreadsheet}
                disabled={isLoadingSpreadsheet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isLoadingSpreadsheet ? 'animate-spin text-emerald-400' : ''
                  }`}
                />
                Sync with Sheets
              </button>

              {spreadsheetInfo && (
                <a
                  href={spreadsheetInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Open Live Sheet
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search logs by medication, date, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-neutral-400 shrink-0">Filter Med:</span>
              <select
                value={filterMedName}
                onChange={(e) => setFilterMedName(e.target.value)}
                className="bg-neutral-800 border border-neutral-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Medications ({medications.length})</option>
                {medications.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
              <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-neutral-300">
                No matching medication rows found
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                Log a dose above to record your first entry to the spreadsheet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-800/80 text-neutral-300 border-b border-neutral-700 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Specific Medicine</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Logged Via</th>
                    <th className="py-2.5 px-3">Notes / Context</th>
                    <th className="py-2.5 px-3 text-right">Dose #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 font-sans">
                  {filteredLogs.map((log, idx) => (
                    <tr
                      key={log.id || idx}
                      className="hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-neutral-400 font-mono text-[11px]">
                        {log.date}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-mono font-medium">
                        {log.time}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-white bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700">
                          {log.medicationName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300 font-medium">
                        {log.dosage}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300">
                        <span className="inline-flex items-center gap-1.5 text-[11px]">
                          {log.loggedVia.includes('Wear OS') ? (
                            <span className="flex items-center gap-1 text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
                              <Watch className="w-3 h-3" />
                              Wear OS
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                              <Smartphone className="w-3 h-3" />
                              Companion Web
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400 text-[11px] truncate max-w-xs">
                        {log.notes}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-300 font-medium">
                        #{log.doseNumberToday}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MANAGE PREDEFINED LIST */}
      {activeTab === 'meds' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                Predefined Medications Configuration
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                These medicines appear both in this Companion Web App and in the Wear OS watch tile selector.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Add Medication
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {medications.map((med) => {
              const isPrimaryOnWatch = med.id === activeMedication.id;
              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-xl border transition ${
                    isPrimaryOnWatch
                      ? 'bg-neutral-800/90 border-sky-500/80 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black shadow-sm"
                        style={{ backgroundColor: med.color }}
                      >
                        <Pill className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {med.name}
                          </h4>
                          {isPrimaryOnWatch && (
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.2 rounded-full font-semibold">
                              Watch Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {med.dosage} • {med.schedule || 'Scheduled'}
                        </div>
                      </div>
                    </div>

                    {medications.length > 1 && (
                      <button
                        onClick={() => onDeleteMedication(med.id)}
                        className="p-1 rounded text-neutral-500 hover:text-rose-400 transition"
                        title="Delete medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-800 text-xs flex items-center justify-between text-neutral-400">
                    <span>Target: {med.targetDailyDose}x/day</span>
                    {!isPrimaryOnWatch && (
                      <button
                        onClick={() => {
                          onSelectActiveMedication(med);
                          feedback.playTap();
                        }}
                        className="text-sky-400 hover:text-sky-300 font-medium text-xs"
                      >
                        Set as Watch Default
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Custom Time / Notes Log */}
      {customLogMed && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                Log Dose with Custom Time
              </h3>
              <button
                onClick={() => setCustomLogMed(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomLogSubmit} className="space-y-4 text-xs">
              <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold"
                  style={{ backgroundColor: customLogMed.color }}
                >
                  <Pill className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {customLogMed.name}
                  </div>
                  <div className="text-neutral-400">
                    {customLogMed.dosage}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Time Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:15 AM (leave blank for current time)"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Notes / Meal Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Taken with lunch, watch was charging"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCustomLogMed(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLogging}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition"
                >
                  Confirm & Write to Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Medicine */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                Add Predefined Medicine
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMed} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin, Ibuprofen, Omeprazole"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Dosage / Strength *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 mg, 1 tablet, 10 ml"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Time of Day
                  </label>
                  <select
                    value={newMedTimeOfDay}
                    onChange={(e: any) => setNewMedTimeOfDay(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="bedtime">Bedtime</option>
                    <option value="prn">As Needed (PRN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Daily Frequency
                  </label>
                  <select
                    value={newMedTargetDose}
                    onChange={(e) => setNewMedTargetDose(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value={1}>1x daily</option>
                    <option value={2}>2x daily</option>
                    <option value={3}>3x daily</option>
                    <option value={4}>4x daily</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a78bfa', '#fb923c'].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewMedColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          newMedColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Instructions / Schedule Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take with full glass of water after food"
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition"
                >
                  Save to Predefined List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
