'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, TextArea } from '@/components/ui/Field';
import { assessmentApi, certificatesApi, coursesApi, groupsApi, submissionsApi } from '@/lib/api';
import type { Certificate, Course, Enrollment, ProgressiveTest } from '@/types/domain';

export function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<{ enrollment: Enrollment; videos: Course['videos'] } | null>(null);
  const [test, setTest] = useState<ProgressiveTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [homework, setHomework] = useState('');
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [courseRows, certRows] = await Promise.all([coursesApi.list(), certificatesApi.mine().catch(() => [])]);
    setCourses(courseRows);
    setCertificates(certRows);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function enroll(courseId: string) {
    const enrollment = await coursesApi.enroll(courseId);
    setActiveEnrollment(enrollment);
    setProgress(await coursesApi.progress(enrollment.id));
    setMessage('Enrollment active. Video 1 is unlocked.');
  }

  async function openTest(position: number) {
    if (!activeEnrollment) return;
    const built = await assessmentApi.build(activeEnrollment.id, position);
    setTest(built);
    setAnswers({});
  }

  async function submitTest(event: FormEvent) {
    event.preventDefault();
    if (!test) return;
    const attempt = await assessmentApi.submit(test.enrollmentId, test.afterVideoPosition, test.assessmentSetIds, answers);
    setMessage(attempt.passed ? 'Passed. The next video is unlocked.' : 'Failed. Retry will use a different question set when available.');
    setProgress(await coursesApi.progress(test.enrollmentId));
    setTest(null);
  }

  async function submitHomework(videoId: string) {
    if (!activeEnrollment) return;
    await submissionsApi.submitHomework({ enrollmentId: activeEnrollment.id, videoId, textAnswer: homework });
    setHomework('');
    setMessage('Homework submitted. Trainer has been notified.');
  }

  async function askTrainer(trainerId?: string) {
    if (!trainerId || !question) return;
    await groupsApi.askTrainer(trainerId, question);
    setQuestion('');
    setMessage('Question sent to trainer.');
  }

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-md border border-lightBorder bg-cardBgActive p-3 text-sm text-lightGrayHover">{message}</p> : null}

      <Card id="courses">
        <CardTitle title="Available Courses" caption="Select courses matched to your learning level and start progressive unlocking." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive">
              <p className="font-medium text-pureWhite">{course.title}</p>
              <p className="mt-1 text-sm text-bodyGrayText">{course.level} · {course.trainer?.name ?? 'Trainer'}</p>
              <p className="mt-3 text-sm text-bodyGrayText">{course.description}</p>
              <Button className="mt-4 w-full" onClick={() => enroll(course.id)}>Enroll</Button>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card id="testing">
          <CardTitle title="Progressive Learning" caption="Each video unlocks only after passing its cumulative test." />
          {progress?.videos?.length ? (
            <div className="space-y-3">
              {progress.videos.map((video) => (
                <div key={video.id} className="rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-pureWhite">{video.position}. {video.title}</p>
                      <p className="mt-1 text-sm text-bodyGrayText">{video.locked ? 'Locked' : 'Unlocked'} · {video.summary ?? 'Summary available after trainer upload'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled={video.locked} variant="ghost" onClick={() => window.open(video.videoUrl, '_blank')}>Watch</Button>
                      <Button disabled={video.locked} onClick={() => openTest(video.position)}>Take Test</Button>
                    </div>
                  </div>
                  {!video.locked ? (
                    <div className="mt-4 space-y-3">
                      <Field label="Practical Homework">
                        <TextArea value={homework} onChange={(event) => setHomework(event.target.value)} placeholder="Write your homework notes or submission link" />
                      </Field>
                      <Button variant="ghost" onClick={() => submitHomework(video.id)}>Submit Homework</Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No active course selected" detail="Enroll in a course to see video unlock progress." />
          )}
        </Card>

        <Card>
          <CardTitle title="Chat With Trainer" caption="Ask private questions from the active course trainer." />
          <Field label="Question">
            <TextArea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a course question" />
          </Field>
          <Button className="mt-3 w-full" variant="ghost" onClick={() => askTrainer(activeEnrollment?.course?.trainer?.id)}>Send Question</Button>
          <Button className="mt-3 w-full" onClick={() => groupsApi.joinGlobal().then(() => setMessage('Joined Global GrapeTask LMS Group.'))}>Join Global Group</Button>
        </Card>
      </section>

      {test ? (
        <Card>
          <CardTitle title={`Progressive Test After Video ${test.afterVideoPosition}`} caption="Questions are selected by backend-controlled assessment sets." />
          <form className="space-y-4" onSubmit={submitTest}>
            {test.questions.map((questionItem) => (
              <Field key={questionItem.id} label={questionItem.prompt}>
                {questionItem.options?.length ? (
                  <select className="theme-focus min-h-11 w-full rounded-md border border-lightBorder bg-cardBg px-3 text-sm text-pureWhite" value={answers[questionItem.id] ?? ''} onChange={(event) => setAnswers({ ...answers, [questionItem.id]: event.target.value })} required>
                    <option value="">Select answer</option>
                    {questionItem.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <TextArea value={answers[questionItem.id] ?? ''} onChange={(event) => setAnswers({ ...answers, [questionItem.id]: event.target.value })} required />
                )}
              </Field>
            ))}
            <Button>Submit Test</Button>
          </form>
        </Card>
      ) : null}

      <Card id="certificates">
        <CardTitle title="Certificates" caption="Download GrapeTask LMS certificates after final approval." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {certificates.length ? certificates.map((certificate) => (
            <a key={certificate.id} className="rounded-md border border-lightBorder bg-cardBg p-4 transition hover:bg-cardBgActive" href={certificate.certificateUrl} download="grapetask-certificate.pdf">
              <p className="font-medium text-lightGrayHover">{certificate.badge}</p>
              <p className="mt-1 text-sm text-bodyGrayText">{new Date(certificate.certificationDate).toDateString()}</p>
            </a>
          )) : <EmptyState title="No certificates yet" detail="Your certificate appears here after final comprehensive test completion." />}
        </div>
      </Card>
    </div>
  );
}
