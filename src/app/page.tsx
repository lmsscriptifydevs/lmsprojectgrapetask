'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { dashboardForRole } from '@/lib/routes';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const rawUser = window.localStorage.getItem('grapetask_lms_user');
    const token = window.localStorage.getItem('grapetask_lms_token');
    if (!token || !rawUser) {
      router.replace('/login');
      return;
    }
    router.replace(dashboardForRole(JSON.parse(rawUser).role));
  }, [router]);

  return <main className="min-h-screen bg-mainBg" />;
}
