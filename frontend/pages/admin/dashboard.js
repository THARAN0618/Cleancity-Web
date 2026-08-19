import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { apiFetch, getUser } from '../../lib/api';

const STATUSES = ['Pending', 'In Progress', 'Resolved'];
const badgeColor = {
  Pending: 'text-amber-700',
  'In Progress': 'text-blue-700',
  Resolved: 'text-green-700'
};

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const user = typeof window !== 'undefined' ? getUser() : null;

  async function load() {
    try {
      const d = await apiFetch('/api/admin/reports');
      setReports(d.reports);
      const c = {};
      d.counts.forEach((row) => (c[row.status] = row.c));
      setCounts(c);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function changeStatus(id, status) {
    try {
      await apiFetch(`/api/admin/reports/${id}/status`, { method: 'PATCH', body: { status } });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const visible = filter === 'All' ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-forest-700 text-xs font-semibold tracking-wide">WARD 14 · GANDHIPURAM</p>
        <h1 className="text-2xl font-semibold mt-1">Complaint queue</h1>
        <p className="text-sm text-gray-500 mb-6">Review incoming garbage overflow reports and move each one through its status.</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Stat label="PENDING" value={counts.Pending || 0} />
          <Stat label="IN PROGRESS" value={counts['In Progress'] || 0} />
          <Stat label="RESOLVED" value={counts.Resolved || 0} />
          <Stat label="TOTAL" value={reports.length} />
        </div>

        <div className="flex gap-2 mb-3">
          {['All', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium ${filter === s ? 'bg-forest-700 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Reported by</th>
                <th className="px-4 py-3">Filed</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 text-forest-700 font-medium">{r.public_id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.location}</div>
                    <div className="text-xs text-gray-400 max-w-xs truncate">{r.description}</div>
                  </td>
                  <td className="px-4 py-3">{r.reported_by}</td>
                  <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => changeStatus(r.id, e.target.value)}
                      className={`border rounded-md text-xs px-2 py-1 font-medium ${badgeColor[r.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No reports in this view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
