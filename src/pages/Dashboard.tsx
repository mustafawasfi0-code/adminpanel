import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPatients } from '../lib/data';
import type { Profile } from '../lib/types';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    listPatients()
      .then((data) => {
        if (active) setPatients(data);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Could not load patients.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.doctor_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) // ضفنا الإيميل للبحث
    );
  }, [patients, query]);

  return (
    <div>
      <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink tracking-tight">Patients</h1>
          <p className="text-sm text-brand-slate mt-1">
            <span className="tabular">{patients.length}</span> patient
            {patients.length === 1 ? '' : 's'} on record
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, city…" // غيرنا النص التوضيحي
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-brand-line bg-brand-paper px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-sky focus:border-brand-sky transition-colors"
        />
      </div>

      {loading && <p className="text-sm text-brand-slate">Loading patients…</p>}
      {error && (
        <div className="rounded-lg bg-zone-redSoft border border-zone-red/30 text-zone-red text-sm px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-card bg-brand-paper border border-brand-line px-6 py-14 text-center text-brand-slate text-sm">
          {patients.length === 0 ? 'No patients yet.' : 'No patients match your search.'}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-brand-paper rounded-card border border-brand-line overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-slate border-b border-brand-line bg-brand-mist/60">
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Email</th> {/* ضفنا عنوان الإيميل */}
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Age</th>
                <th className="px-5 py-3 font-medium">Sex</th>
                <th className="px-5 py-3 font-medium">Personal best PEF</th>
                <th className="px-5 py-3 font-medium">Doctor</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-brand-line last:border-0 hover:bg-brand-mist/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 shrink-0 rounded-full bg-brand-skySoft text-brand-skyDeep font-semibold text-xs flex items-center justify-center">
                        {initials(p.name || '?')}
                      </span>
                      <span className="font-semibold text-brand-ink">{p.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-brand-slate">{p.email || '—'}</td> {/* ضفنا عرض الإيميل */}
                  <td className="px-5 py-3.5 text-brand-slate">{p.city || '—'}</td>
                  <td className="px-5 py-3.5 text-brand-slate tabular">{p.age ?? '—'}</td>
                  <td className="px-5 py-3.5 text-brand-slate">{p.sex || '—'}</td>
                  <td className="px-5 py-3.5 text-brand-slate tabular">
                    {p.personal_best_pef ? `${p.personal_best_pef} L/min` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-brand-slate">{p.doctor_name || '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/patients/${p.id}`}
                      className="text-brand-sky font-medium hover:text-brand-skyDeep hover:underline"
                    >
                      View report →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}