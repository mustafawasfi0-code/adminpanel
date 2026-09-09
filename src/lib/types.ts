export interface Profile {
  id: string;
  name: string;
  email: string | null; // ضفنا هذا السطر للإيميل
  city: string;
  age: number;
  sex: string;
  height_cm: number;
  personal_best_pef: number | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  role: string;
  updated_at?: string;
}

export interface EmergencyContact {
  contact_name: string;
  relationship: string;
  phone_number: string;
}

export interface MedicationRow {
  code: string;
  name_ar: string;
  name_en: string;
  medication_type: string;
}

export interface PeakFlowLog {
  id: string;
  reading: number | null;
  reading_1: number | null;
  reading_2: number | null;
  reading_3: number | null;
  highest_reading: number | null;
  zone: string | null;
  measured_at: string;
}

export interface SymptomLog {
  id: string;
  symptoms: string[];
  severity: number;
  notes: string | null;
  occurred_at: string;
}

export interface TriggerLog {
  id: string;
  triggers: string[];
  occurred_at: string;
}

export interface PatientReport {
  profile: Profile;
  emergencyContact: EmergencyContact | null;
  medications: MedicationRow[];
  peakFlows: PeakFlowLog[];
  symptoms: SymptomLog[];
  triggers: TriggerLog[];
}
 