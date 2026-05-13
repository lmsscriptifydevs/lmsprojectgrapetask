'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/Field';
import { coursesApi, institutionsApi, reportsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { Course, Institution, PricingPackage, User } from '@/types/domain';

export function InstituteDashboard() {
  const { user } = useAuthStore();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [groupForm, setGroupForm] = useState({ name: '', type: 'class' as 'institute' | 'class' | 'trainer_head_room' });
  const [reportForm, setReportForm] = useState({ learnerId: '', courseId: '', remarks: '' });
  const [message, setMessage] = useState('');

  const institutionId = useMemo(() => user?.institutionId ?? institutions[0]?.id ?? '', [institutions, user?.institutionId]);

  async function load() {
    const [institutionRows, courseRows, packageRows] = await Promise.all([
      institutionsApi.list().catch(() => []),
      coursesApi.list(),
      institutionsApi.pricing(),
    ]);
    setInstitutions(institutionRows);
    setCourses(courseRows);
    setPackages(packageRows);
    const id = user?.institutionId ?? institutionRows[0]?.id;
    if (id) {
      const [studentRows, reportRows] = await Promise.all([institutionsApi.students(id), reportsApi.byInstitution(id).catch(() => [])]);
      setStudents(studentRows.filter((student) => student.role === 'learner'));
      setReports(reportRows);
    }
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    if (!institutionId) return;
    await institutionsApi.createGroup(institutionId, groupForm);
    setGroupForm({ name: '', type: 'class' });
    setMessage('Group created.');
  }

  async function requestReport(event: FormEvent) {
    event.preventDefault();
    if (!institutionId) return;
    await reportsApi.create({ ...reportForm, institutionId });
    setReportForm({ learnerId: '', courseId: '', remarks: '' });
    setMessage('Report generated and available for download.');
    await load();
  }

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-md border border-lightBorder bg-cardBgActive p-3 text-sm text-lightGrayHover">{message}</p> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-bodyGrayText">Institution</p>
          <p className="mt-2 text-xl font-semibold text-pureWhite">{institutions.find((item) => item.id === institutionId)?.name ?? 'Portal'}</p>
        </Card>
        <Card>
          <p className="text-sm text-bodyGrayText">Students</p>
          <p className="mt-2 text-xl font-semibold text-pureWhite">{students.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-bodyGrayText">Courses</p>
          <p className="mt-2 text-xl font-semibold text-pureWhite">{courses.length}</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card id="students">
          <CardTitle title="Manage Students" caption="Student accounts linked to this institutional portal." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-mediumGrayTitle">
                <tr className="border-b border-lightBorder">
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Category</th>
                  <th>Marketplace</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-lightBorder text-bodyGrayText">
                    <td className="py-3 text-lightGrayHover">{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.learnerCategory}</td>
                    <td>{student.marketplaceGigAccess ? 'Enabled' : 'Locked'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardTitle title="Assign Courses" caption="Select relevant courses for institutional learners." />
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="rounded-md border border-lightBorder bg-cardBg p-3 transition hover:bg-cardBgActive">
                <p className="text-sm font-medium text-lightGrayHover">{course.title}</p>
                <p className="text-sm text-bodyGrayText">{course.level}</p>
                <Button className="mt-3 w-full" variant="ghost" onClick={() => setMessage(`Course assignment queued for ${course.title}.`)}>
                  Assign Course
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card id="groups">
          <CardTitle title="Groups And Class Groups" caption="Create institute, class, and trainer-head communication rooms." />
          <form className="space-y-4" onSubmit={createGroup}>
            <Field label="Group Name"><TextInput value={groupForm.name} onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })} required /></Field>
            <Field label="Group Type">
              <SelectInput value={groupForm.type} onChange={(event) => setGroupForm({ ...groupForm, type: event.target.value as 'institute' | 'class' | 'trainer_head_room' })}>
                <option value="institute">Institute Group</option>
                <option value="class">Class Group</option>
                <option value="trainer_head_room">Trainer Head Room</option>
              </SelectInput>
            </Field>
            <Button>Create Group</Button>
          </form>
        </Card>

        <Card>
          <CardTitle title="Subscription Packages" caption="Business learner pricing and discounts." />
          <div className="grid gap-3 sm:grid-cols-2">
            {packages.map((item) => (
              <div key={item.id} className="rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive">
                <p className="font-medium text-pureWhite">{item.level} · {item.duration}</p>
                <p className="mt-2 text-xl font-semibold text-primaryOrange">{item.pricePerStudentPkr} PKR</p>
                <p className="mt-1 text-sm text-bodyGrayText">{item.grapeTaskRevenuePercent}% GrapeTask · {item.trainerRevenuePercent}% Trainers</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="reports" className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle title="Request Report" caption="Generate downloadable student progress reports." />
          <form className="space-y-4" onSubmit={requestReport}>
            <Field label="Student">
              <SelectInput value={reportForm.learnerId} onChange={(event) => setReportForm({ ...reportForm, learnerId: event.target.value })} required>
                <option value="">Select student</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </SelectInput>
            </Field>
            <Field label="Course">
              <SelectInput value={reportForm.courseId} onChange={(event) => setReportForm({ ...reportForm, courseId: event.target.value })} required>
                <option value="">Select course</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </SelectInput>
            </Field>
            <Field label="Remarks"><TextArea value={reportForm.remarks} onChange={(event) => setReportForm({ ...reportForm, remarks: event.target.value })} required /></Field>
            <Button>Generate Report</Button>
          </form>
        </Card>

        <Card>
          <CardTitle title="Download Reports" caption="PDF reports delivered through LMS inbox and email workflow." />
          <div className="space-y-3">
            {reports.length ? reports.map((report) => (
              <a key={report.id} className="block rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive" href={report.reportUrl} download="grapetask-progress-report.pdf">
                <p className="font-medium text-lightGrayHover">Progress Report</p>
                <p className="mt-1 text-sm text-bodyGrayText">{new Date(report.createdAt).toDateString()}</p>
              </a>
            )) : <EmptyState title="No reports yet" detail="Generated progress reports will appear here." />}
          </div>
        </Card>
      </section>
    </div>
  );
}
