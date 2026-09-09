import { supabase } from '../supabaseClient';
import type { PatientReport, Profile } from './types';

/** List every patient profile the signed-in admin is allowed to see. */
export async function listPatients(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, name, city, age, sex, height_cm, personal_best_pef, doctor_name, doctor_phone, role, updated_at'
    )
    .eq('role', 'patient')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

/** Full doctor-report-style bundle for one patient. */
export async function loadPatientReport(userId: string): Promise<PatientReport> {
  const [profileRes, contactRes, medsRes, peakRes, symptomRes, triggerRes] =
    await Promise.all([
      supabase
        .from('profiles')
        .select(
          'id, name, city, age, sex, height_cm, personal_best_pef, doctor_name, doctor_phone, role, updated_at'
        )
        .eq('id', userId)
        .single(),
      supabase
        .from('emergency_contacts')
        .select('contact_name, relationship, phone_number')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_medications')
        .select('medications(code, name_ar, name_en, medication_type)')
        .eq('user_id', userId),
      supabase
        .from('peak_flow_logs')
        .select(
          'id, reading, reading_1, reading_2, reading_3, highest_reading, zone, measured_at'
        )
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(50),
      supabase
        .from('symptom_logs')
        .select('id, symptoms, severity, notes, occurred_at')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(50),
      supabase
        .from('trigger_logs')
        .select('id, triggers, occurred_at')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(50),
    ]);

  if (profileRes.error) throw profileRes.error;
  if (!profileRes.data) throw new Error('Patient not found');

  const medications = ((medsRes.data ?? []) as any[])
    .map((row) => row.medications)
    .filter(Boolean);

  return {
    profile: profileRes.data as Profile,
    emergencyContact: contactRes.data ?? null,
    medications,
    peakFlows: (peakRes.data ?? []) as any,
    symptoms: (symptomRes.data ?? []) as any,
    triggers: (triggerRes.data ?? []) as any,
  };
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
