import { Achievement } from '../types';

const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
  <div className="glass-card p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-brand-300">{achievement.type}</p>
        <h3 className="mt-2 text-lg font-bold text-white">{achievement.title}</h3>
        <p className="mt-2 text-sm text-slate-300">{achievement.description}</p>
      </div>
      <div className="rounded-2xl bg-brand-500/20 px-3 py-2 text-2xl">🏆</div>
    </div>
    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Earned {new Date(achievement.earnedAt).toLocaleDateString()}</p>
  </div>
);

export default AchievementBadge;
