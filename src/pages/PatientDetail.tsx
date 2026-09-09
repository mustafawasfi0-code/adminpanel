import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadPatientReport, formatDate } from '../lib/data';
import type { PatientReport } from '../lib/types';

function zoneStyle(zone: string | null) {
  switch (zone) {
    case 'green':
      return 'bg-zone-greenSoft text-zone-green';
    case 'yellow':
      return 'bg-zone-amberSoft text-zone-amber';
    case 'red':
      return 'bg-zone-redSoft text-zone-red';
    default:
      return 'bg-brand-mist text-brand-slate';
  }
}

function Section({
  title,
  children,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <div className="bg-brand-paper rounded-card border border-brand-line p-5 sm:p-6">
      <h2 className="font-bold text-brand-ink mb-4">{title}</h2>
      {empty ? (
        <p className="text-sm text-brand-slate">No records.</p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function VitalRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-brand-slate">{label}</span>
      <span className="font-semibold text-brand-ink text-right tabular">{value}</span>
    </>
  );
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<PatientReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    loadPatientReport(id)
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Could not load this patient.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div>
      <Link to="/" className="text-sm text-brand-sky font-medium hover:text-brand-skyDeep hover:underline">
        ← Back to patients
      </Link>

      {loading && <p className="text-sm text-brand-slate mt-6">Loading report…</p>}
      {error && (
        <div className="mt-6 rounded-lg bg-zone-redSoft border border-zone-red/30 text-zone-red text-sm px-4 py-3">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-6 space-y-5">
          <div className="bg-brand-paper rounded-card border border-brand-line p-6 sm:p-7">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-2xl font-bold text-brand-ink tracking-tight">
                  {report.profile.name}
                </h1>
                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2">
                  <span className="text-sm rounded-chip bg-brand-mist px-2.5 py-0.5 text-brand-slate">
                    {report.profile.city}
                  </span>
                  <span className="text-sm rounded-chip bg-brand-mist px-2.5 py-0.5 text-brand-slate tabular">
                    {report.profile.age} yrs
                  </span>
                  <span className="text-sm rounded-chip bg-brand-mist px-2.5 py-0.5 text-brand-slate">
                    {report.profile.sex}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <VitalRow label="Height" value={`${report.profile.height_cm} cm`} />
                <VitalRow
                  label="Personal best PEF"
                  value={
                    report.profile.personal_best_pef
                      ? `${report.profile.personal_best_pef} L/min`
                      : 'Not set'
                  }
                />
                <VitalRow label="Doctor" value={report.profile.doctor_name || 'Not set'} />
                <VitalRow label="Doctor phone" value={report.profile.doctor_phone || 'Not set'} />
              </div>
            </div>
          </div>

          <Section title="Current medications" empty={report.medications.length === 0}>
            <div className="flex flex-wrap gap-2">
              {report.medications.map((m) => (
                <span
                  key={m.code}
                  className={`text-sm rounded-chip px-3 py-1.5 font-medium ${
                    m.medication_type === 'emergency'
                      ? 'bg-zone-redSoft text-zone-red'
                      : 'bg-brand-skySoft text-brand-skyDeep'
                  }`}
                >
                  {m.name_en} · {m.medication_type === 'emergency' ? 'Rescue' : 'Controller'}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Peak flow readings" empty={report.peakFlows.length === 0}>
            {report.peakFlows.map((row) => {
              const highest = row.highest_reading ?? row.reading;
              const readings = [row.reading_1, row.reading_2, row.reading_3]
                .filter((v) => v != null)
                .join(', ');
              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between border-b border-brand-line last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-brand-ink tabular">{highest} L/min</p>
                    <p className="text-xs text-brand-slate mt-0.5">
                      {readings && <span className="tabular">{readings} · </span>}
                      {formatDate(row.measured_at)}
                    </p>
                  </div>
                  {row.zone && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-chip ${zoneStyle(row.zone)}`}>
                      {row.zone}
                    </span>
                  )}
                </div>
              );
            })}
          </Section>

          <Section title="Symptoms" empty={report.symptoms.length === 0}>
            {report.symptoms.map((row) => (
              <div key={row.id} className="border-b border-brand-line last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-brand-ink">
                    {(row.symptoms ?? []).join(', ') || '—'}
                  </p>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-chip bg-brand-mist text-brand-slate tabular shrink-0">
                    {row.severity}/5
                  </span>
                </div>
                <p className="text-xs text-brand-slate mt-0.5">{formatDate(row.occurred_at)}</p>
                {row.notes && <p className="text-sm text-brand-slate mt-1.5">{row.notes}</p>}
              </div>
            ))}
          </Section>

          <Section title="Triggers" empty={report.triggers.length === 0}>
            {report.triggers.map((row) => (
              <div key={row.id} className="border-b border-brand-line last:border-0 pb-3 last:pb-0">
                <p className="font-semibold text-brand-ink">
                  {(row.triggers ?? []).join(', ') || '—'}
                </p>
                <p className="text-xs text-brand-slate mt-0.5">{formatDate(row.occurred_at)}</p>
              </div>
            ))}
          </Section>

          <Section title="Emergency contact" empty={!report.emergencyContact}>
            {report.emergencyContact && (
              <div className="grid grid-cols-2 gap-y-2 text-sm max-w-sm">
                <VitalRow label="Name" value={report.emergencyContact.contact_name} />
                <VitalRow label="Relationship" value={report.emergencyContact.relationship} />
                <VitalRow label="Phone" value={report.emergencyContact.phone_number} />
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
