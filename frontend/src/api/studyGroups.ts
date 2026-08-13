import client from './client';
import { Achievement, LeaderboardEntry, StudyGroup } from '../types';

export const getStudyGroupsRequest = async () => {
  const { data } = await client.get<StudyGroup[]>('/api/study-groups');
  return data;
};

export const createStudyGroupRequest = async (payload: Partial<StudyGroup>) => {
  const { data } = await client.post<StudyGroup>('/api/study-groups', payload);
  return data;
};

export const joinStudyGroupRequest = async (code: string) => {
  const { data } = await client.post<{ message: string; group: StudyGroup }>('/api/study-groups/join', { code });
  return data;
};

export const getLeaderboardRequest = async () => {
  const { data } = await client.get<LeaderboardEntry[]>('/api/leaderboard');
  return data;
};

export const getAchievementsRequest = async () => {
  const { data } = await client.get<Achievement[]>('/api/achievements');
  return data;
};
