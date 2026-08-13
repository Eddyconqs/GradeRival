import { useEffect, useState } from 'react';
import { getAchievementsRequest } from '../api/studyGroups';
import AchievementBadge from '../components/AchievementBadge';
import { mockAchievements } from '../data/mockData';
import { Achievement } from '../types';

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);

  useEffect(() => {
    getAchievementsRequest().then(setAchievements).catch(() => setAchievements(mockAchievements));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Achievements</p>
        <h1 className="mt-2 text-3xl font-black text-white">Celebrate the consistency that moves your grades.</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => <AchievementBadge key={achievement.id} achievement={achievement} />)}
      </div>
    </div>
  );
};

export default AchievementsPage;
