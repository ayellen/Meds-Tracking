export interface Medication {
  id: string;
  name: string;
  dosage: string;
  color: string;
  icon: 'pill' | 'tablet' | 'capsule' | 'dropper' | 'syringe' | 'heart';
  schedule?: string; // e.g. "Morning (8:00 AM)"
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'prn';
  instructions?: string; // e.g. "Take with food"
  targetDailyDose: number;
  remainingCount?: number;
}

export interface MedicationLogEntry {
  id?: string;
  timestamp: string;
  date: string;
  time: string;
  medicationName: string;
  dosage: string;
  loggedVia: string;
  notes: string;
  doseNumberToday: number;
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
  sheetName: string;
}

export type WatchScreen = 'quick-log' | 'med-select' | 'history' | 'settings';
export type DeviceStyle = 'pixel' | 'galaxy' | 'square' | 'frameless';
export type AppMode = 'companion' | 'watch' | 'split';
