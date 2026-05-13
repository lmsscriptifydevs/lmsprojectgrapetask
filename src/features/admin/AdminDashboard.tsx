'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { analyticsApi, coursesApi, usersApi } from '@/lib/api';
import type { Course, User } from '@/types/domain';

export function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  async function load() {
    try {
      const [courseRows, userRows, overview] = await Promise.all([coursesApi.adminList(), usersApi.list(), analyticsApi.overview()]);
      setCourses(courseRows);
      setUsers(userRows);
      setAnalytics(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin dashboard');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function reviewCourse(courseId: string, status: 'approved' | 'rejected') {
    await coursesApi.adminReview(courseId, status);
    await load();
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-md border border-orangeBorderActive bg-cardBgActive p-3 text-sm text-primaryOrange">{error}</p> : null}
      <section id="analytics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {['learners', 'trainers', 'institutes', 'courses', 'enrollments', 'certificates'].map((key) => (
          <Card key={key}>
            <p className="text-sm text-bodyGrayText">{key}</p>
            <p className="mt-2 text-2xl font-semibold text-pureWhite">{analytics[key] ?? 0}</p>
          </Card>
        ))}
      </section>

      <Card id="courses">
        <CardTitle title="Course Approval System" caption="Review trainer-submitted courses before publication." />
        <div className="space-y-3">
          {courses.length ? (
            courses.map((course) => (
              <div key={course.id} className="flex flex-col gap-3 rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-pureWhite">{course.title}</p>
                  <p className="mt-1 text-sm text-bodyGrayText">{course.level} · {course.status} · {course.trainer?.name ?? 'Trainer'}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => reviewCourse(course.id, 'approved')}>Approve</Button>
                  <Button variant="ghost" onClick={() => reviewCourse(course.id, 'rejected')}>Reject</Button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No courses yet" detail="Trainer course submissions will appear here." />
          )}
        </div>
      </Card>

      <Card id="users">
        <CardTitle title="User Management" caption="Admin view of learners, trainers, and institute heads." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-mediumGrayTitle">
              <tr className="border-b border-lightBorder">
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Category</th>
                <th>Marketplace</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-lightBorder text-bodyGrayText">
                  <td className="py-3 text-lightGrayHover">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.learnerCategory ?? user.trainerLevel ?? 'Portal'}</td>
                  <td>{user.marketplaceGigAccess ? 'Enabled' : 'Locked'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle title="Trainer Verification" caption="Trainer profiles include portfolio, teaching experience, and joining reason during registration." />
        <div className="grid gap-3 md:grid-cols-3">
          {users.filter((user) => user.role === 'trainer').map((trainer) => (
            <div key={trainer.id} className="rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive">
              <p className="font-medium text-lightGrayHover">{trainer.name}</p>
              <p className="mt-1 text-sm text-bodyGrayText">{trainer.email}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
