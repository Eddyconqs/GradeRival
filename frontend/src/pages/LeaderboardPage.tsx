import { useEffect, useState } from 'react';
import { getLeaderboardRequest } from '../api/studyGroups';
import LeaderboardRow from '../components/LeaderboardRow';
import { mockLeaderboard } from '../data/mockData';
import { LeaderboardEntry } from '../types';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);

  useEffect(() => {
    getLeaderboardRequest().then(setLeaderboard).catch(() => setLeaderboard(mockLeaderboard));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-black text-white">See how your progress stacks up.</h1>
      </div>
      <div className="glass-card p-6">
        <div className="space-y-4">
          {leaderboard.map((entry) => <LeaderboardRow key={entry.userId} entry={entry} />)}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
