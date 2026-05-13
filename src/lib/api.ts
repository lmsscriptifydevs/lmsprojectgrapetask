import axios, { AxiosError } from 'axios';
import type {
  Certificate,
  Course,
  CourseStatus,
  Enrollment,
  Institution,
  LearningLevel,
  PricingPackage,
  ProgressiveTest,
  ReviewDecision,
  TestAttempt,
  User,
} from '@/types/domain';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('grapetask_lms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.localStorage.removeItem('grapetask_lms_token');
      window.localStorage.removeItem('grapetask_lms_user');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    const message = error.response?.data?.message;
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message ?? error.message));
  },
);

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  role: 'admin' | 'trainer' | 'learner' | 'institute_head';
  learnerCategory?: string;
  trainerLevel?: string;
  portfolio?: string;
  teachingExperience?: string;
  joiningReason?: string;
  institutionId?: string;
}

export const authApi = {
  async login(input: LoginInput) {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/login', input);
    return data;
  },
  async register(input: RegisterInput) {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/register', input);
    return data;
  },
  async profile() {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('grapetask_lms_user') : null;
    return raw ? (JSON.parse(raw) as User) : null;
  },
};

export const coursesApi = {
  async list(level?: LearningLevel) {
    const { data } = await api.get<Course[]>('/courses/published', { params: { level } });
    return data;
  },
  async adminList() {
    const { data } = await api.get<Course[]>('/courses/admin');
    return data;
  },
  async create(input: Pick<Course, 'title' | 'description' | 'level'>) {
    const { data } = await api.post<Course>('/courses', input);
    return data;
  },
  async submitReview(courseId: string) {
    const { data } = await api.post<Course>(`/courses/${courseId}/submit-review`);
    return data;
  },
  async adminReview(courseId: string, status: Extract<CourseStatus, 'approved' | 'rejected'>, notes?: string) {
    const { data } = await api.patch<Course>(`/courses/${courseId}/admin-review`, { status, notes });
    return data;
  },
  async addVideo(courseId: string, input: { title: string; position: number; videoUrl: string; summary?: string }) {
    const { data } = await api.post(`/courses/${courseId}/videos`, input);
    return data;
  },
  async addAssessmentSet(videoId: string, input: unknown) {
    const { data } = await api.post(`/courses/videos/${videoId}/assessment-sets`, input);
    return data;
  },
  async enroll(courseId: string) {
    const { data } = await api.post<Enrollment>(`/courses/${courseId}/enroll`);
    return data;
  },
  async progress(enrollmentId: string) {
    const { data } = await api.get<{ enrollment: Enrollment; videos: Course['videos'] }>(`/courses/enrollments/${enrollmentId}/progress`);
    return data;
  },
};

export const assessmentApi = {
  async build(enrollmentId: string, position: number) {
    const { data } = await api.get<ProgressiveTest>(`/assessments/enrollments/${enrollmentId}/after-video/${position}`);
    return data;
  },
  async submit(enrollmentId: string, position: number, assessmentSetIds: string[], answers: Record<string, unknown>) {
    const { data } = await api.post<TestAttempt>(`/assessments/enrollments/${enrollmentId}/after-video/${position}/submit`, {
      assessmentSetIds,
      answers,
    });
    return data;
  },
};

export const submissionsApi = {
  async submitHomework(input: { enrollmentId: string; videoId: string; fileUrl?: string; textAnswer?: string }) {
    const { data } = await api.post('/submissions/homework', input);
    return data;
  },
  async trainerList() {
    const { data } = await api.get('/submissions/trainer');
    return data;
  },
  async review(id: string, decision: ReviewDecision, remarks?: string) {
    const { data } = await api.patch(`/submissions/${id}/review`, { decision, remarks });
    return data;
  },
};

export const institutionsApi = {
  async list() {
    const { data } = await api.get<Institution[]>('/institutions');
    return data;
  },
  async students(institutionId: string) {
    const { data } = await api.get<User[]>(`/institutions/${institutionId}/students`);
    return data;
  },
  async pricing(level?: LearningLevel) {
    const { data } = await api.get<PricingPackage[]>('/institutions/pricing', { params: { level } });
    return data;
  },
  async createGroup(institutionId: string, input: { name: string; type: 'institute' | 'class' | 'trainer_head_room' }) {
    const { data } = await api.post(`/institutions/${institutionId}/groups`, input);
    return data;
  },
};

export const groupsApi = {
  async joinGlobal() {
    const { data } = await api.post('/groups/global/join');
    return data;
  },
  async mine() {
    const { data } = await api.get('/groups/mine');
    return data;
  },
  async messages(groupId: string) {
    const { data } = await api.get(`/groups/${groupId}/messages`);
    return data;
  },
  async send(groupId: string, body: string, voiceNoteUrl?: string) {
    const { data } = await api.post(`/groups/${groupId}/messages`, { body, voiceNoteUrl });
    return data;
  },
  async askTrainer(trainerId: string, body: string) {
    const { data } = await api.post('/groups/questions', { trainerId, body });
    return data;
  },
};

export const reportsApi = {
  async create(input: { learnerId: string; institutionId: string; courseId: string; remarks: string }) {
    const { data } = await api.post('/reports', input);
    return data;
  },
  async byInstitution(institutionId: string) {
    const { data } = await api.get(`/reports/institutions/${institutionId}`);
    return data;
  },
};

export const certificatesApi = {
  async mine() {
    const { data } = await api.get<Certificate[]>('/certificates/mine');
    return data;
  },
};

export const meetingsApi = {
  async create(input: { courseId: string; startsAt: string; provider: 'zoom' | 'google_meet'; meetingUrl: string; agenda?: string }) {
    const { data } = await api.post('/meetings', input);
    return data;
  },
  async byCourse(courseId: string) {
    const { data } = await api.get(`/meetings/courses/${courseId}`);
    return data;
  },
};

export const analyticsApi = {
  async overview() {
    const { data } = await api.get('/analytics/overview');
    return data;
  },
};

export const usersApi = {
  async list(role?: string) {
    const { data } = await api.get<User[]>('/users', { params: { role } });
    return data;
  },
};
