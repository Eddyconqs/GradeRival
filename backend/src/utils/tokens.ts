import jwt from 'jsonwebtoken';
import { User } from '../types';

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} must be set before starting the GradeRival backend.`);
  }
  return value;
};

export const signAccessToken = (user: User) =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    getRequiredEnv('JWT_SECRET'),
    { expiresIn: '15m' }
  );

export const signRefreshToken = (user: User) =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    getRequiredEnv('JWT_REFRESH_SECRET'),
    { expiresIn: '7d' }
  );

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, getRequiredEnv('JWT_SECRET')) as jwt.JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, getRequiredEnv('JWT_REFRESH_SECRET')) as jwt.JwtPayload;
