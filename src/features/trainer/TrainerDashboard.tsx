'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/Field';
import { coursesApi, meetingsApi, reportsApi, submissionsApi } from '@/lib/api';
import type { Course, LearningLevel, ReviewDecision } from '@/types/domain';

export function TrainerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', level: 'university' as LearningLevel });
  const [videoForm, setVideoForm] = useState({ courseId: '', title: '', position: 1, videoUrl: '', summary: '' });
  const [meetingForm, setMeetingForm] = useState({ courseId: '', startsAt: '', provider: 'zoom' as 'zoom' | 'google_meet', meetingUrl: '', agenda: '' });
  const [message, setMessage] = useState('');

  async function load() {
    const [courseRows, submissionRows] = await Promise.all([coursesApi.list(), submissionsApi.trainerList()]);
    setCourses(courseRows);
    setSubmissions(submissionRows);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function createCourse(event: FormEvent) {
    event.preventDefault();
    const created = await coursesApi.create(courseForm);
    setCourseForm({ title: '', description: '', level: 'university' });
    setMessage(`Course created: ${created.title}`);
    await load();
  }

  async function addVideo(event: FormEvent) {
    event.preventDefault();
    await coursesApi.addVideo(videoForm.courseId, {
      title: videoForm.title,
      position: Number(videoForm.position),
      videoUrl: videoForm.videoUrl,
      summary: videoForm.summary,
    });
    setMessage('Video added. Add MCQ, quiz, summary, and homework sets through the assessment builder payload.');
    setVideoForm({ courseId: '', title: '', position: 1, videoUrl: '', summary: '' });
    await load();
  }

  async function reviewSubmission(id: string, decision: ReviewDecision) {
    await submissionsApi.review(id, decision, decision === 'fail' ? 'Rewatch the video and retry a different test set.' : 'Reviewed by trainer.');
    await load();
  }

  async function createMeeting(event: FormEvent) {
    event.preventDefault();
    await meetingsApi.create(meetingForm);
    setMeetingForm({ courseId: '', startsAt: '', provider: 'zoom', meetingUrl: '', agenda: '' });
    setMessage('Meeting scheduled.');
  }

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-md border border-lightBorder bg-cardBgActive p-3 text-sm text-lightGrayHover">{message}</p> : null}

      <section id="courses" className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle title="Create Course" caption="Prepare level-specific course material for admin approval." />
          <form className="space-y-4" onSubmit={createCourse}>
            <Field label="Title"><TextInput value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required /></Field>
            <Field label="Level">
              <SelectInput value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as LearningLevel })}>
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="university">University</option>
                <option value="individual">Individual</option>
              </SelectInput>
            </Field>
            <Field label="Description"><TextArea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required /></Field>
            <Button>Create Course</Button>
          </form>
        </Card>

        <Card>
          <CardTitle title="Upload Video" caption="Attach HD lesson video URLs and summary content." />
          <form className="space-y-4" onSubmit={addVideo}>
            <Field label="Course">
              <SelectInput value={videoForm.courseId} onChange={(e) => setVideoForm({ ...videoForm, courseId: e.target.value })} required>
                <option value="">Select course</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </SelectInput>
            </Field>
            <Field label="Video Title"><TextInput value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} required /></Field>
            <Field label="Position"><TextInput type="number" min={1} value={videoForm.position} onChange={(e) => setVideoForm({ ...videoForm, position: Number(e.target.value) })} required /></Field>
            <Field label="Video URL"><TextInput value={videoForm.videoUrl} onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })} required /></Field>
            <Field label="Summary"><TextArea value={videoForm.summary} onChange={(e) => setVideoForm({ ...videoForm, summary: e.target.value })} /></Field>
            <Button>Add Video</Button>
          </form>
        </Card>
      </section>

      <Card>
        <CardTitle title="My Courses" caption="Submit complete courses for GrapeTask admin approval." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive">
              <p className="font-medium text-pureWhite">{course.title}</p>
              <p className="mt-1 text-sm text-bodyGrayText">{course.level} · {course.status}</p>
              <Button className="mt-4 w-full" variant="ghost" onClick={() => coursesApi.submitReview(course.id).then(load)}>Submit Review</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card id="submissions">
        <CardTitle title="Review Submissions" caption="Trainer decision controls student improvement and retest flow." />
        <div className="space-y-3">
          {submissions.length ? submissions.map((submission) => (
            <div key={submission.id} className="rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive">
              <p className="font-medium text-pureWhite">{submission.enrollment?.learner?.name ?? 'Learner'} · {submission.video?.title ?? 'Homework'}</p>
              <p className="mt-1 text-sm text-bodyGrayText">{submission.textAnswer ?? submission.fileUrl ?? 'Submitted work'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(['pass', 'fail', 'improve'] as ReviewDecision[]).map((decision) => (
                  <Button key={decision} variant={decision === 'pass' ? 'primary' : 'ghost'} onClick={() => reviewSubmission(submission.id, decision)}>
                    {decision}
                  </Button>
                ))}
              </div>
            </div>
          )) : <EmptyState title="No submissions" detail="Homework submissions will appear after learners submit assignments." />}
        </div>
      </Card>

      <section id="meetings" className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle title="Schedule Meeting" caption="Create weekly Q&A links for Zoom or Google Meet." />
          <form className="space-y-4" onSubmit={createMeeting}>
            <Field label="Course"><SelectInput value={meetingForm.courseId} onChange={(e) => setMeetingForm({ ...meetingForm, courseId: e.target.value })} required><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</SelectInput></Field>
            <Field label="Starts At"><TextInput type="datetime-local" value={meetingForm.startsAt} onChange={(e) => setMeetingForm({ ...meetingForm, startsAt: e.target.value })} required /></Field>
            <Field label="Provider"><SelectInput value={meetingForm.provider} onChange={(e) => setMeetingForm({ ...meetingForm, provider: e.target.value as 'zoom' | 'google_meet' })}><option value="zoom">Zoom</option><option value="google_meet">Google Meet</option></SelectInput></Field>
            <Field label="Meeting URL"><TextInput value={meetingForm.meetingUrl} onChange={(e) => setMeetingForm({ ...meetingForm, meetingUrl: e.target.value })} required /></Field>
            <Field label="Agenda"><TextArea value={meetingForm.agenda} onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })} /></Field>
            <Button>Schedule</Button>
          </form>
        </Card>
        <Card id="reports">
          <CardTitle title="Reports" caption="Generate weekly or biweekly progress reports from the reports module." />
          <p className="text-sm text-bodyGrayText">Report generation is connected through the central API service and available when learner, institution, and course IDs are selected from institute workflows.</p>
          <Button className="mt-4" variant="ghost" onClick={() => setMessage('Use POST /api/reports through reportsApi.create with learner, institute, course, and remarks.')}>Report API Ready</Button>
        </Card>
      </section>
    </div>
  );
}
