import Link from 'next/link';
import { useRouter } from 'next/router';
import { clearSession, getUser } from '../lib/api';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => setUser(getUser()), []);

  function signOut() {
    clearSession();
    router.push('/auth');
  }

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-forest-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="bg-forest-700 rounded-md w-7 h-7 flex items-center justify-center">🗑️</span>
          CleanCity
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {!isAdmin && (
            <>
              <Link href="/report" className="hover:underline">Report</Link>
              <Link href="/complaints" className="hover:underline">My Complaints</Link>
            </>
          )}
          {isAdmin && <Link href="/admin/dashboard" className="hover:underline">Admin Dashboard</Link>}
          {user ? (
            <button onClick={signOut} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md">
              Sign out
            </button>
          ) : (
            <Link href="/auth" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
