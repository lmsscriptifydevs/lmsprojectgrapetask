'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';

interface NavItem {
  label: string;
  href: string;
}

const navByArea: Record<string, NavItem[]> = {
  Admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Courses', href: '/admin/dashboard#courses' },
    { label: 'Users', href: '/admin/dashboard#users' },
    { label: 'Analytics', href: '/admin/dashboard#analytics' },
  ],
  Trainer: [
    { label: 'Dashboard', href: '/trainer/dashboard' },
    { label: 'Courses', href: '/trainer/dashboard#courses' },
    { label: 'Submissions', href: '/trainer/dashboard#submissions' },
    { label: 'Meetings', href: '/trainer/dashboard#meetings' },
  ],
  Student: [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Courses', href: '/student/dashboard#courses' },
    { label: 'Testing', href: '/student/dashboard#testing' },
    { label: 'Certificates', href: '/student/dashboard#certificates' },
  ],
  Institute: [
    { label: 'Dashboard', href: '/institute/dashboard' },
    { label: 'Students', href: '/institute/dashboard#students' },
    { label: 'Groups', href: '/institute/dashboard#groups' },
    { label: 'Reports', href: '/institute/dashboard#reports' },
  ],
};

export function DashboardShell({ area, children }: { area: keyof typeof navByArea; children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-mainBg text-pureWhite">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-lightBorder bg-cardBg md:block">
          <div className="border-b border-lightBorder p-6">
            <p className="text-lg font-semibold text-pureWhite">GrapeTask LMS</p>
            <p className="mt-1 text-sm text-bodyGrayText">{area} Portal</p>
          </div>
          <nav className="space-y-2 p-4">
            {navByArea[area].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md border border-lightBorder bg-cardBg px-4 py-3 text-sm text-mediumGrayTitle transition hover:border-orangeBorderActive hover:bg-cardBgActive hover:text-lightGrayHover"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-lightBorder bg-cardBg">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
              <div>
                <p className="text-sm text-bodyGrayText">{user?.email}</p>
                <h1 className="text-xl font-semibold text-pureWhite">{area} Dashboard</h1>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
              >
                Logout
              </Button>
            </div>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
