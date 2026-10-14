import { Medication } from '../types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dosage: '10 mg',
    color: '#38bdf8', // Sky blue
    icon: 'tablet',
    schedule: 'Morning (8:00 AM)',
    timeOfDay: 'morning',
    instructions: 'Take with water before breakfast',
    targetDailyDose: 1,
    remainingCount: 28,
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500 mg',
    color: '#34d399', // Emerald
    icon: 'capsule',
    schedule: 'Twice daily (Breakfast & Dinner)',
    timeOfDay: 'evening',
    instructions: 'Take with food to minimize GI discomfort',
    targetDailyDose: 2,
    remainingCount: 54,
  },
  {
    id: 'med-3',
    name: 'Vitamin D3',
    dosage: '2,000 IU',
    color: '#fbbf24', // Amber gold
    icon: 'pill',
    schedule: 'With lunch (12:30 PM)',
    timeOfDay: 'afternoon',
    instructions: 'Take with meal containing dietary fat',
    targetDailyDose: 1,
    remainingCount: 42,
  },
  {
    id: 'med-4',
    name: 'Atorvastatin',
    dosage: '20 mg',
    color: '#a78bfa', // Purple
    icon: 'tablet',
    schedule: 'Bedtime (10:00 PM)',
    timeOfDay: 'bedtime',
    instructions: 'Take at night before sleep',
    targetDailyDose: 1,
    remainingCount: 19,
  },
];
