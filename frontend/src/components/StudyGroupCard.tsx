import { StudyGroup } from '../types';

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoin: (code: string) => void;
}

const StudyGroupCard = ({ group, onJoin }: StudyGroupCardProps) => (
  <div className="glass-card p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-xl font-bold text-white">{group.name}</h3>
        <p className="mt-2 text-sm text-slate-300">{group.description}</p>
      </div>
      <div className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-200">{group.memberCount ?? 0}/{group.maxMembers}</div>
    </div>
    <div className="mt-5 flex items-center justify-between gap-4 text-sm text-slate-400">
      <span>Join code {group.code}</span>
      <button
        onClick={() => {
          if (!group.joined) {
            onJoin(group.code);
          }
        }}
        disabled={group.joined}
        className={group.joined ? 'btn-secondary cursor-not-allowed opacity-70' : 'btn-primary'}
      >
        {group.joined ? 'Joined' : 'Join group'}
      </button>
    </div>
  </div>
);

export default StudyGroupCard;
