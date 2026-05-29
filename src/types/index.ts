/**
 * Core TypeScript types for the Didactic Guide application
 */

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Course & Lessons
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: User;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  price: number;
  rating: number;
  enrollmentCount: number;
  totalLessons: number;
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'code' | 'link';
  url: string;
  description?: string;
}

// Quiz & Assessment
export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: Question[];
  passingScore: number;
  adaptive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
  submittedAt: Date;
  feedback: QuizFeedback[];
}

export interface QuizFeedback {
  questionId: string;
  isCorrect: boolean;
  explanation: string;
  selectedAnswer: string;
}

// Progress & Analytics
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonsCompleted: number;
  quizzesCompleted: number;
  averageScore: number;
  timeSpent: number; // in minutes
  startedAt: Date;
  completedAt?: Date;
  currentLessonId?: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  timeSpent: number; // in minutes
  viewedAt: Date;
  completedAt?: Date;
}

export interface DashboardMetrics {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalLearningMinutes: number;
  averageCourseRating: number;
  certifications: Certification[];
}

export interface Certification {
  id: string;
  courseId: string;
  userId: string;
  issuedAt: Date;
  certificateUrl: string;
}

// Enrollment & Subscription
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  enrolledAt: Date;
  completedAt?: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  price: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  popular?: boolean;
}

// UI State
export interface UIState {
  modals: Record<string, boolean>;
  notifications: Notification[];
  isLoading: boolean;
  sidebarOpen: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  createdAt: Date;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Component Props
export interface ComponentProps {
  className?: string;
  testId?: string;
}
