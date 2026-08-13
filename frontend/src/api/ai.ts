import client from './client';
import { StudyGuide } from '../types';

export const generateStudyGuideRequest = async (courseId: string, topic?: string) => {
  const { data } = await client.post<StudyGuide>('/api/ai/study-guide', { courseId, topic });
  return data;
};
