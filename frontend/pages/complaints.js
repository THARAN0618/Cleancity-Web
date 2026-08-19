import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import StatusTracker from '../components/StatusTracker';
import { apiFetch } from '../lib/api';

const badgeColor = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700'
};

export default function Complaints() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/reports')
      .then((d) => setReports(d.reports))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-forest-700 text-xs font-semibold tracking-wide">YOUR REPORTS</p>
            <h1 className="text-2xl font-semibold mt-1">My complaints</h1>
            <p className="text-sm text-gray-500">Every report you've filed, and where it stands right now.</p>
          </div>
          <Link href="/report" className="bg-forest-700 hover:bg-forest-800 text-white text-sm px-4 py-2 rounded-md">
            + New report
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">{r.public_id}</p>
                  <p className="font-medium">📍 {r.location}</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">{r.description}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor[r.status]}`}>
                  ● {r.status}
                </span>
              </div>
              <StatusTracker status={r.status} />
              <p className="text-xs text-gray-400 mt-3">
                Filed {new Date(r.created_at).toLocaleString()} · Updated {new Date(r.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {reports.length === 0 && !error && (
            <p className="text-sm text-gray-500">No reports yet — file your first one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
