import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Pill,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Medication, MedicationLogEntry, SpreadsheetInfo } from '../types';

interface CompanionDashboardProps {
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
  onManualLogDose: (med: Medication) => void;
  isLogging: boolean;
}

export const CompanionDashboard: React.FC<CompanionDashboardProps> = ({
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
  onManualLogDose,
  isLogging,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedColor, setNewMedColor] = useState('#38bdf8');
  const [newMedSchedule, setNewMedSchedule] = useState('');
  const [newMedTargetDose, setNewMedTargetDose] = useState(1);

  // Form submission for adding to predefined list
  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    onAddMedication({
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      color: newMedColor,
      icon: 'pill',
      schedule: newMedSchedule.trim() || 'Daily as needed',
      instructions: 'Take as directed',
      targetDailyDose: Number(newMedTargetDose) || 1,
    });

    setNewMedName('');
    setNewMedDosage('');
    setNewMedSchedule('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-5 text-neutral-100 max-w-4xl mx-auto w-full">
      {/* Top Banner: Google Account & Spreadsheet Connection Status */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Wear OS Medication Logger
                </h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Live Sheets Sync
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Every button tap on your smartwatch instantly appends the selected medicine to your Google Sheet.
              </p>
            </div>
          </div>

          {/* Authentication controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-neutral-700/60">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-neutral-600"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left text-xs">
                  <div className="font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user.displayName || 'Connected'}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out of Google"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-700/60 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official GSI Material Sign-in button */
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
              </button>
            )}
          </div>
        </div>

        {/* Spreadsheet Status Bar */}
        {spreadsheetInfo ? (
          <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-neutral-400">Target Google Sheet:</span>
              <strong className="text-emerald-400 font-medium">
                {spreadsheetInfo.name}
              </strong>
              <span className="text-neutral-500 text-[11px]">
                ({spreadsheetInfo.sheetName})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefreshSpreadsheet}
                disabled={isLoadingSpreadsheet}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isLoadingSpreadsheet ? 'animate-spin text-emerald-400' : ''
                  }`}
                />
                Refresh Rows
              </button>

              <a
                href={spreadsheetInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Open Live Sheet
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          !isAuthenticated && (
            <div className="mt-3 text-xs text-amber-300/90 bg-amber-950/40 border border-amber-900/50 p-2.5 rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Please click "Sign in with Google" above to automatically create or link your "Wear OS Medication Log" spreadsheet.
              </span>
            </div>
          )
        )}
      </div>

      {/* Predefined List of Medicines Management */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-sky-400" />
              Predefined Medication List
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select any medicine below or from your watch to log. You can customize the predefined list anytime.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Medication
          </button>
        </div>

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medications.map((med) => {
            const isSelected = med.id === activeMedication.id;
            const todayLogs = recentLogs.filter(
              (l) => l.medicationName === med.name
            );

            return (
              <div
                key={med.id}
                className={`relative p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-neutral-800/90 border-sky-500/80 shadow-md ring-1 ring-sky-500/40'
                    : 'bg-neutral-900/60 hover:bg-neutral-800/50 border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-black shadow-sm"
                      style={{ backgroundColor: med.color }}
                    >
                      <Pill className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {med.name}
                        </span>
                        {isSelected && (
                          <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                            Active on Watch
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-medium">
                        {med.dosage} • {med.schedule || 'Scheduled'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {medications.length > 1 && (
                      <button
                        onClick={() => onDeleteMedication(med.id)}
                        title="Remove from list"
                        className="p-1 rounded text-neutral-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Actions for each medicine card */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-400">
                    Target: {med.targetDailyDose}x/day • {todayLogs.length} total logged
                  </span>

                  <div className="flex items-center gap-2">
                    {!isSelected && (
                      <button
                        onClick={() => onSelectActiveMedication(med)}
                        className="text-[11px] font-medium text-sky-400 hover:text-sky-300 transition"
                      >
                        Set as Watch Primary
                      </button>
                    )}

                    <button
                      onClick={() => onManualLogDose(med)}
                      disabled={isLogging || !isAuthenticated}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-black shadow-sm transition active:scale-95 disabled:opacity-40"
                      style={{ backgroundColor: med.color }}
                      title="Log this dose now"
                    >
                      Log to Sheet
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Synced Spreadsheet Table */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Recorded Spreadsheet Rows ({recentLogs.length})
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live entries stored in Google Sheets tab: <em>"{spreadsheetInfo?.sheetName || 'Medication Logs'}"</em>
            </p>
          </div>

          {spreadsheetInfo && (
            <a
              href={spreadsheetInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              View in Google Sheets
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-neutral-300">
              No medication rows recorded yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              Select any medicine on your Wear OS watch or click "Log to Sheet" on a card above to append your first row.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-800/80 text-neutral-300 border-b border-neutral-700/80 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Specific Medicine</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Logged Via</th>
                  <th className="py-2.5 px-3">Status / Notes</th>
                  <th className="py-2.5 px-3 text-right">Dose #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 font-sans">
                {recentLogs.map((log, idx) => (
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
                    <td className="py-2.5 px-3 text-neutral-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {log.loggedVia}
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

      {/* Modal: Add Medicine to Predefined List */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                  placeholder="e.g. Amoxicillin, Ibuprofen, Adderall"
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
                  placeholder="e.g. 250 mg, 1 tablet, 10 ml"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <option value={0}>As needed (PRN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Watch Button Color
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
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Schedule / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take with morning meal"
                  value={newMedSchedule}
                  onChange={(e) => setNewMedSchedule(e.target.value)}
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
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
