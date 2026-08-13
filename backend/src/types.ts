import { Request } from 'express';

export type UserRole = 'STUDENT' | 'ADMIN';
export type GroupRole = 'OWNER' | 'MODERATOR' | 'MEMBER';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  bio?: string;
  avatar?: string;
  school?: string;
  graduationYear?: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
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

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  code: string;
  isPublic: boolean;
  maxMembers: number;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  earnedAt: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
}

export interface StudyGuide {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  createdAt: string;
}

export interface AuthRequest extends Request {
  user?: Pick<User, 'id' | 'email' | 'username' | 'role'>;
}
