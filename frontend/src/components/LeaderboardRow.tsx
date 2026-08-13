import { LeaderboardEntry } from '../types';

const LeaderboardRow = ({ entry }: { entry: LeaderboardEntry }) => (
  <div className="grid grid-cols-[60px_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
    <div className="text-center text-2xl font-black text-white">#{entry.rank}</div>
    <div className="flex items-center gap-4">
      <img src={entry.avatar ?? `https://ui-avatars.com/api/?name=${entry.username}&background=2563eb&color=ffffff`} alt={entry.username} className="h-12 w-12 rounded-full object-cover" />
      <div>
        <p className="font-semibold text-white">{entry.username}</p>
        <p className="text-sm text-slate-400">{entry.school ?? 'GradeRival community'} • {entry.courses} courses</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-2xl font-black text-white">{entry.averageGrade.toFixed(1)}%</p>
      <p className="text-sm text-slate-400">Average</p>
    </div>
  </div>
);

export default LeaderboardRow;
