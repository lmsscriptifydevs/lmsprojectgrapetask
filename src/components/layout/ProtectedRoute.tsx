'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { dashboardForRole, roleForPath } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, hydrate } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    const storedToken = token ?? window.localStorage.getItem('grapetask_lms_token');
    const rawUser = user ?? JSON.parse(window.localStorage.getItem('grapetask_lms_user') ?? 'null');
    if (!storedToken || !rawUser) {
      router.replace('/login');
      return;
    }
    const requiredRole = roleForPath(pathname);
    if (requiredRole && rawUser.role !== requiredRole) {
      router.replace(dashboardForRole(rawUser.role));
    }
  }, [pathname, ready, router, token, user]);

  if (!ready) return <div className="min-h-screen bg-mainBg" />;
  return <>{children}</>;
}
