import { Achievement, Assignment, Course, LeaderboardEntry, StudyGroup, User } from '../types';
import { buildCourseStats, summarizeCourses } from '../utils/grades';

const now = new Date().toISOString();

export const demoUser: User = {
  id: 'user-demo',
  email: 'demo@graderival.app',
  username: 'gradeguru',
  bio: 'AP student balancing honors classes, robotics, and student council.',
  avatar: 'https://ui-avatars.com/api/?name=Grade+Guru&background=8b5cf6&color=ffffff',
  school: 'North Ridge High School',
  graduationYear: 2027,
  role: 'STUDENT',
  createdAt: now,
  updatedAt: now
};

export const mockAssignments: Record<string, Assignment[]> = {
  'course-calc': [
    { id: 'a1', courseId: 'course-calc', name: 'Limits Quiz', category: 'Quizzes', weight: 20, earnedPoints: 18, totalPoints: 20, dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), submitted: true, createdAt: now },
    { id: 'a2', courseId: 'course-calc', name: 'Derivative Worksheet', category: 'Homework', weight: 15, earnedPoints: 47, totalPoints: 50, dueDate: new Date(Date.now() + 86400000 * 4).toISOString(), submitted: true, createdAt: now },
    { id: 'a3', courseId: 'course-calc', name: 'Optimization Project', category: 'Projects', weight: 25, totalPoints: 100, dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), submitted: false, createdAt: now }
  ],
  'course-bio': [
    { id: 'a4', courseId: 'course-bio', name: 'Cell Lab Report', category: 'Labs', weight: 30, earnedPoints: 92, totalPoints: 100, dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), submitted: true, createdAt: now },
    { id: 'a5', courseId: 'course-bio', name: 'Genetics Test', category: 'Tests', weight: 35, earnedPoints: 87, totalPoints: 100, dueDate: new Date(Date.now() + 86400000 * 6).toISOString(), submitted: true, createdAt: now },
    { id: 'a6', courseId: 'course-bio', name: 'Ecology Reflection', category: 'Homework', weight: 15, totalPoints: 40, dueDate: new Date(Date.now() + 86400000 * 8).toISOString(), submitted: false, createdAt: now }
  ]
};

const baseCourses: Course[] = [
  { id: 'course-calc', userId: 'user-demo', name: 'AP Calculus AB', code: 'MATH-221', instructor: 'Ms. Hart', credits: 1, semester: 'Fall', year: 2026, gradingScale: 'percentage', targetGrade: 'A', color: '#8b5cf6', createdAt: now },
  { id: 'course-bio', userId: 'user-demo', name: 'Honors Biology', code: 'BIO-201', instructor: 'Dr. Lennox', credits: 1, semester: 'Fall', year: 2026, gradingScale: 'percentage', targetGrade: 'A-', color: '#2563eb', createdAt: now }
];

export const mockCourses = summarizeCourses(baseCourses, mockAssignments);

export const mockAchievements: Achievement[] = [
  { id: 'ach-1', userId: 'user-demo', type: 'streak', title: 'Seven-Day Scholar', description: 'Logged study sessions for seven days straight.', earnedAt: now },
  { id: 'ach-2', userId: 'user-demo', type: 'grades', title: 'Above 90 Club', description: 'Maintained a 90%+ average across active courses.', earnedAt: now },
  { id: 'ach-3', userId: 'user-demo', type: 'community', title: 'Study Squad Captain', description: 'Created your first study group.', earnedAt: now }
];

export const mockStudyGroups: StudyGroup[] = [
  { id: 'group-1', name: 'Calculus Crunch Crew', description: 'Weekly problem-solving sprints for AP Calc students.', code: 'CALC24', isPublic: true, maxMembers: 12, memberCount: 8, joined: true, createdAt: now },
  { id: 'group-2', name: 'Bio Builders', description: 'Lab prep, flashcards, and accountability check-ins.', code: 'BIO88', isPublic: true, maxMembers: 16, memberCount: 11, joined: false, createdAt: now }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'user-rival', username: 'studyace', avatar: 'https://ui-avatars.com/api/?name=Study+Ace&background=2563eb&color=ffffff', averageGrade: 95.2, courses: 5, school: 'North Ridge High School' },
  { rank: 2, userId: 'user-demo', username: 'gradeguru', avatar: demoUser.avatar, averageGrade: 91.4, courses: 4, school: demoUser.school },
  { rank: 3, userId: 'user-peer', username: 'lablegend', avatar: 'https://ui-avatars.com/api/?name=Lab+Legend&background=0f172a&color=ffffff', averageGrade: 89.7, courses: 4, school: 'Central STEM Academy' }
];

export const mockStatsByCourse = Object.fromEntries(
  Object.entries(mockAssignments).map(([courseId, assignments]) => [courseId, buildCourseStats(assignments)])
);
