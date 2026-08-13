import client from './client';
import { Assignment, Course, CourseStats } from '../types';

export const getCoursesRequest = async () => {
  const { data } = await client.get<Course[]>('/api/courses');
  return data;
};

export const createCourseRequest = async (payload: Partial<Course>) => {
  const { data } = await client.post<Course>('/api/courses', payload);
  return data;
};

export const updateCourseRequest = async (courseId: string, payload: Partial<Course>) => {
  const { data } = await client.put<Course>(`/api/courses/${courseId}`, payload);
  return data;
};

export const deleteCourseRequest = async (courseId: string) => {
  const { data } = await client.delete<{ message: string }>(`/api/courses/${courseId}`);
  return data;
};

export const getAssignmentsRequest = async (courseId: string) => {
  const { data } = await client.get<Assignment[]>(`/api/courses/${courseId}/assignments`);
  return data;
};

export const addAssignmentRequest = async (courseId: string, payload: Partial<Assignment>) => {
  const { data } = await client.post<Assignment>(`/api/courses/${courseId}/assignments`, payload);
  return data;
};

export const updateAssignmentRequest = async (courseId: string, assignmentId: string, payload: Partial<Assignment>) => {
  const { data } = await client.put<Assignment>(`/api/courses/${courseId}/assignments/${assignmentId}`, payload);
  return data;
};

export const deleteAssignmentRequest = async (courseId: string, assignmentId: string) => {
  const { data } = await client.delete<{ message: string }>(`/api/courses/${courseId}/assignments/${assignmentId}`);
  return data;
};

export const getCourseStatsRequest = async (courseId: string) => {
  const { data } = await client.get<CourseStats>(`/api/courses/${courseId}/stats`);
  return data;
};
