import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrapeTask LMS System',
  description: 'Skill learning, assessments, certification, institutions, trainers, and freelance marketplace readiness.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
