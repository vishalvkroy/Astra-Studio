// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId: string;
  totalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  longestStreak: number;
  cppProgress: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  rank: number;
  totalUsers: number;
  achievements: Achievement[];
  sessionTime: number;
  lastActive: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'learning' | 'streak' | 'mastery' | 'social';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profilePicture?: string;
  score: number;
  questionsAnswered: number;
  accuracy: number;
  level: string;
}

// Question Types
export interface Question {
  id: string;
  question: string;
  answer: string;
  options: string[];
  hint: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  points: number;
}

// Note Types
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  folder: string;
  questionId?: string;
  createdAt: string;
  expiresAt?: string;
  isSaved: boolean;
  tags: string[];
}

export interface NoteFolder {
  id: string;
  name: string;
  userId: string;
  parentId?: string;
  createdAt: string;
  noteCount: number;
}

// Conversation Types
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    questionId?: string;
    isQuiz?: boolean;
    emotion?: string;
  };
}

// 3D Character Types
export interface CharacterHandle {
  faceCamera: () => void;
  setAnimation: (animation: 'idle' | 'talk' | 'think' | 'celebrate' | 'explain') => void;
  playGesture: (gesture: string) => void;
}

// Dashboard Types
export interface DashboardStats {
  todayProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
  totalLearningTime: number;
  currentStreak: number;
  questionsToday: number;
  accuracyRate: number;
  skillLevels: SkillLevel[];
}

export interface SkillLevel {
  skill: string;
  level: number;
  maxLevel: number;
  progress: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Session Types
export interface LearningSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  questionsAnswered: number;
  correctAnswers: number;
  topicscovered: string[];
  level: string;
}

// Email Verification Types
export interface EmailVerification {
  email: string;
  token: string;
  expiresAt: string;
}

// Profile Update Types
export interface ProfileUpdateData {
  username?: string;
  email?: string;
  profilePicture?: File | string;
  currentPassword?: string;
  newPassword?: string;
}

// Whiteboard Types
export interface WhiteboardContent {
  id: string;
  content: string;
  timestamp: number;
  questionId?: string;
  isVisible: boolean;
  duration: number;
}

// Speech Recognition Types
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Analytics Types
export interface ProgressAnalytics {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  topicsStudied: string[];
}

export interface PerformanceMetrics {
  overall: {
    accuracy: number;
    averageTime: number;
    consistency: number;
  };
  byDifficulty: {
    beginner: { accuracy: number; count: number };
    intermediate: { accuracy: number; count: number };
    advanced: { accuracy: number; count: number };
  };
  byCategory: Record<string, { accuracy: number; count: number }>;
  trends: {
    improving: boolean;
    rate: number;
  };
}
