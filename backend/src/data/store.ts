import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Achievement, Assignment, Course, Friendship, GroupMember, StudyGroup, StudyGuide, User } from '../types';

const now = () => new Date().toISOString();

const demoPassword = bcrypt.hashSync('Password123!', 10);

const users: User[] = [
  {
    id: 'user-demo',
    email: 'demo@graderival.app',
    password: demoPassword,
    username: 'gradeguru',
    bio: 'AP student balancing honors classes and robotics.',
    avatar: 'https://ui-avatars.com/api/?name=Grade+Guru&background=8b5cf6&color=fff',
    school: 'North Ridge High School',
    graduationYear: 2027,
    role: 'STUDENT',
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 'user-rival',
    email: 'rival@graderival.app',
    password: demoPassword,
    username: 'studyace',
    bio: 'Mathlete, debate captain, and quiz bowl regular.',
    avatar: 'https://ui-avatars.com/api/?name=Study+Ace&background=2563eb&color=fff',
    school: 'North Ridge High School',
    graduationYear: 2026,
    role: 'STUDENT',
    createdAt: now(),
    updatedAt: now()
  }
];

const courses: Course[] = [
  {
    id: 'course-calc',
    userId: 'user-demo',
    name: 'AP Calculus AB',
    code: 'MATH-221',
    instructor: 'Ms. Hart',
    credits: 1,
    semester: 'Fall',
    year: 2026,
    gradingScale: 'percentage',
    targetGrade: 'A',
    color: '#8b5cf6',
    createdAt: now()
  },
  {
    id: 'course-bio',
    userId: 'user-demo',
    name: 'Honors Biology',
    code: 'BIO-201',
    instructor: 'Dr. Lennox',
    credits: 1,
    semester: 'Fall',
    year: 2026,
    gradingScale: 'percentage',
    targetGrade: 'A-',
    color: '#2563eb',
    createdAt: now()
  }
];

const assignments: Assignment[] = [
  {
    id: 'asg-1',
    courseId: 'course-calc',
    name: 'Limits Quiz',
    category: 'Quizzes',
    weight: 20,
    earnedPoints: 18,
    totalPoints: 20,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    submitted: true,
    createdAt: now()
  },
  {
    id: 'asg-2',
    courseId: 'course-calc',
    name: 'Derivative Worksheet',
    category: 'Homework',
    weight: 15,
    earnedPoints: 47,
    totalPoints: 50,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    submitted: true,
    createdAt: now()
  },
  {
    id: 'asg-3',
    courseId: 'course-calc',
    name: 'Optimization Project',
    category: 'Projects',
    weight: 25,
    totalPoints: 100,
    dueDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    submitted: false,
    createdAt: now()
  },
  {
    id: 'asg-4',
    courseId: 'course-bio',
    name: 'Cell Lab Report',
    category: 'Labs',
    weight: 30,
    earnedPoints: 92,
    totalPoints: 100,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    submitted: true,
    createdAt: now()
  },
  {
    id: 'asg-5',
    courseId: 'course-bio',
    name: 'Genetics Test',
    category: 'Tests',
    weight: 35,
    earnedPoints: 87,
    totalPoints: 100,
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    submitted: true,
    createdAt: now()
  }
];

const studyGroups: StudyGroup[] = [
  {
    id: 'group-calc',
    name: 'Calculus Crunch Crew',
    description: 'Weekly problem-solving sprints for AP Calc students.',
    code: 'CALC24',
    isPublic: true,
    maxMembers: 12,
    createdAt: now()
  },
  {
    id: 'group-bio',
    name: 'Bio Builders',
    description: 'Lab prep, flashcards, and accountability check-ins.',
    code: 'BIO88',
    isPublic: true,
    maxMembers: 16,
    createdAt: now()
  }
];

const groupMembers: GroupMember[] = [
  { id: 'member-1', groupId: 'group-calc', userId: 'user-demo', role: 'OWNER', joinedAt: now() },
  { id: 'member-2', groupId: 'group-bio', userId: 'user-rival', role: 'OWNER', joinedAt: now() }
];

const achievements: Achievement[] = [
  {
    id: 'ach-1',
    userId: 'user-demo',
    type: 'streak',
    title: 'Seven-Day Scholar',
    description: 'Logged study sessions for seven straight days.',
    earnedAt: now()
  },
  {
    id: 'ach-2',
    userId: 'user-demo',
    type: 'grades',
    title: 'Above 90 Club',
    description: 'Maintained a 90%+ average across active courses.',
    earnedAt: now()
  }
];

const friendships: Friendship[] = [
  {
    id: 'friend-1',
    requesterId: 'user-demo',
    receiverId: 'user-rival',
    status: 'ACCEPTED',
    createdAt: now()
  }
];

const studyGuides: StudyGuide[] = [];
const refreshTokens = new Map<string, string>();
const resetRequests: { email: string; requestedAt: string }[] = [];

export const db = {
  users,
  courses,
  assignments,
  studyGroups,
  groupMembers,
  achievements,
  friendships,
  studyGuides,
  refreshTokens,
  resetRequests,
  nextId: (prefix: string) => `${prefix}-${randomUUID()}`
};
