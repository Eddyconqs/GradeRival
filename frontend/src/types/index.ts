export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  school?: string;
  graduationYear?: number;
  role: 'STUDENT' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  username: string;
  school: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  name: string;
  category: string;
  weight: number;
  earnedPoints?: number;
  totalPoints: number;
  dueDate?: string;
  submitted: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string;
  instructor?: string;
  credits: number;
  semester: string;
  year: number;
  gradingScale: string;
  targetGrade?: string;
  color: string;
  createdAt: string;
  currentGrade?: number;
  projectedGrade?: number;
  assignmentsCount?: number;
}

export interface CategoryStat {
  category: string;
  grade: number;
  assignments: number;
  weight: number;
}

export interface CourseStats {
  currentGrade: number;
  projectedGrade: number;
  neededForA: number;
  completedAssignments: number;
  totalAssignments: number;
  categoryBreakdown: CategoryStat[];
  trend: Array<{ label: string; grade: number }>;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  code: string;
  isPublic: boolean;
  maxMembers: number;
  createdAt: string;
  memberCount?: number;
  joined?: boolean;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  earnedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  averageGrade: number;
  courses: number;
  school?: string;
}

export interface StudyGuide {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  createdAt: string;
}

export interface ProfileSettings {
  showOnLeaderboard: boolean;
  publicProfile: boolean;
  studyReminders: boolean;
}
