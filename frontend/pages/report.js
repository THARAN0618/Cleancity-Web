import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';

export default function Report() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`),
      () => setError('Could not detect location — please type it in')
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!location || !description) {
      setError('Location and description are required');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('location', location);
      fd.append('description', description);
      if (photo) fd.append('photo', photo);
      await apiFetch('/api/reports', { method: 'POST', body: fd, isForm: true });
      router.push('/complaints');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-forest-700 text-xs font-semibold tracking-wide">NEW REPORT</p>
        <h1 className="text-2xl font-semibold mt-1">Report garbage overflow</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Tell us where it is and what you're seeing. Reports are routed to the ward sanitation officer.
        </p>

        <form onSubmit={submit} className="bg-white border rounded-lg p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Location</label>
              <button type="button" onClick={useCurrentLocation} className="text-xs text-forest-700 font-medium">
                📍 Use current location
              </button>
            </div>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Gandhipuram Town Bus Stand, Coimbatore"
            />
            <p className="text-xs text-gray-400 mt-1">Pin auto-detected from GPS — edit before submitting.</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[90px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overflowing bin near the bus stand entrance for 3 days..."
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Photo <span className="text-xs text-gray-400 font-normal">Optional</span>
            </label>
            <label className="border-2 border-dashed rounded-md flex flex-col items-center justify-center py-8 cursor-pointer text-center">
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              <span className="text-2xl mb-1">⬆️</span>
              <span className="text-sm font-medium">
                {photo ? photo.name : 'Drag and drop a photo, or click to browse'}
              </span>
              <span className="text-xs text-gray-400 mt-1">JPG or PNG · Max 8MB</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm border rounded-md">
              Cancel
            </button>
            <button
              disabled={loading}
              className="px-4 py-2 text-sm bg-forest-700 hover:bg-forest-800 text-white rounded-md disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit report'}
            </button>
          </div>

          <p className="text-xs text-gray-400 bg-gray-50 rounded-md p-2">
            Your file is scanned and validated server-side before storage — only image files
            under the size limit are accepted, and each upload is linked to your account via
            role-based access control.
          </p>
        </form>
      </div>
    </div>
  );
}
