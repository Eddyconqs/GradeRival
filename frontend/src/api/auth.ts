import client from './client';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types';

export const loginRequest = async (payload: LoginPayload) => {
  const { data } = await client.post<AuthResponse>('/api/auth/login', payload);
  return data;
};

export const registerRequest = async (payload: RegisterPayload) => {
  const { data } = await client.post<AuthResponse>('/api/auth/register', payload);
  return data;
};

export const forgotPasswordRequest = async (email: string) => {
  const { data } = await client.post<{ message: string }>('/api/auth/forgot-password', { email });
  return data;
};

export const getProfileRequest = async () => {
  const { data } = await client.get<User>('/api/users/profile');
  return data;
};

export const updateProfileRequest = async (payload: Partial<User>) => {
  const { data } = await client.put<User>('/api/users/profile', payload);
  return data;
};
