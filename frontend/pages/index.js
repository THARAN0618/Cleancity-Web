import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUser } from '../lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) router.replace('/auth');
    else if (user.role === 'admin') router.replace('/admin/dashboard');
    else router.replace('/report');
  }, []);

  return null;
}
