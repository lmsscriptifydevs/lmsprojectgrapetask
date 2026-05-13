'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, SelectInput, TextArea, TextInput } from '@/components/ui/Field';
import { dashboardForRole } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';
import type { LearnerCategory, LearningLevel, Role } from '@/types/domain';

export function LoginPanel() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('admin@grapetask.com');
  const [password, setPassword] = useState('Password123!');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = await login({ email, password });
    router.replace(next);
  }

  return (
    <AuthFrame title="Welcome Back" caption="Sign in to continue your GrapeTask LMS workflow.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Email">
          <TextInput value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </Field>
        <Field label="Password">
          <TextInput value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </Field>
        {error ? <p className="text-sm text-primaryOrange">{error}</p> : null}
        <Button className="w-full" disabled={loading}>
          {loading ? 'Signing in' : 'Login'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-bodyGrayText">
        New to GrapeTask LMS?{' '}
        <Link href="/register" className="text-lightGrayHover">
          Create an account
        </Link>
      </p>
    </AuthFrame>
  );
}

export function RegisterPanel() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();
  const [role, setRole] = useState<Role>('learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [learnerCategory, setLearnerCategory] = useState<LearnerCategory>('individual_learner');
  const [trainerLevel, setTrainerLevel] = useState<LearningLevel>('university');
  const [portfolio, setPortfolio] = useState('');
  const [teachingExperience, setTeachingExperience] = useState('');
  const [joiningReason, setJoiningReason] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = await register({
      name,
      email,
      password,
      role,
      learnerCategory: role === 'learner' ? learnerCategory : undefined,
      trainerLevel: role === 'trainer' ? trainerLevel : undefined,
      portfolio: role === 'trainer' ? portfolio : undefined,
      teachingExperience: role === 'trainer' ? teachingExperience : undefined,
      joiningReason: role === 'trainer' ? joiningReason : undefined,
    });
    router.replace(next);
  }

  return (
    <AuthFrame title="Create Account" caption="Choose your LMS role and enter the details needed for access.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Account Type">
          <SelectInput value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="learner">Learner</option>
            <option value="trainer">Trainer</option>
            <option value="institute_head">Institute Head</option>
          </SelectInput>
        </Field>
        <Field label="Name">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Email">
          <TextInput value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </Field>
        <Field label="Password">
          <TextInput value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} required />
        </Field>
        {role === 'learner' ? (
          <Field label="Learner Category">
            <SelectInput value={learnerCategory} onChange={(event) => setLearnerCategory(event.target.value as LearnerCategory)}>
              <option value="school_student">School Student</option>
              <option value="college_student">College Student</option>
              <option value="university_student">University Student</option>
              <option value="individual_learner">Individual Learner</option>
            </SelectInput>
          </Field>
        ) : null}
        {role === 'trainer' ? (
          <>
            <Field label="Trainer Level">
              <SelectInput value={trainerLevel} onChange={(event) => setTrainerLevel(event.target.value as LearningLevel)}>
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="university">University</option>
              </SelectInput>
            </Field>
            <Field label="Portfolio">
              <TextInput value={portfolio} onChange={(event) => setPortfolio(event.target.value)} />
            </Field>
            <Field label="Teaching Experience">
              <TextArea value={teachingExperience} onChange={(event) => setTeachingExperience(event.target.value)} />
            </Field>
            <Field label="Reason For Joining">
              <TextArea value={joiningReason} onChange={(event) => setJoiningReason(event.target.value)} />
            </Field>
          </>
        ) : null}
        {error ? <p className="text-sm text-primaryOrange">{error}</p> : null}
        <Button className="w-full" disabled={loading}>
          {loading ? 'Creating account' : 'Register'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-bodyGrayText">
        Already registered?{' '}
        <Link href="/login" className="text-lightGrayHover">
          Login
        </Link>
      </p>
    </AuthFrame>
  );
}

function AuthFrame({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mainBg px-4 py-10 text-pureWhite">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-sm font-medium text-primaryOrange">GrapeTask LMS System</p>
          <h1 className="mt-2 text-2xl font-semibold text-pureWhite">{title}</h1>
          <p className="mt-2 text-sm text-bodyGrayText">{caption}</p>
        </div>
        {children}
      </Card>
    </main>
  );
}
