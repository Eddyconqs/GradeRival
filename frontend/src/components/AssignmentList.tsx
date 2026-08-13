import { Assignment } from '../types';

const AssignmentList = ({ assignments }: { assignments: Assignment[] }) => (
  <div className="space-y-3">
    {assignments.map((assignment) => {
      const grade = typeof assignment.earnedPoints === 'number' ? (assignment.earnedPoints / assignment.totalPoints) * 100 : null;
      return (
        <div key={assignment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-semibold text-white">{assignment.name}</h4>
              <p className="text-sm text-slate-400">{assignment.category} • Weight {assignment.weight}%</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{grade === null ? 'Pending' : `${grade.toFixed(1)}%`}</p>
              <p className="text-sm text-slate-400">{assignment.earnedPoints ?? 0}/{assignment.totalPoints} points</p>
            </div>
          </div>
          {assignment.dueDate && <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>}
        </div>
      );
    })}
    {!assignments.length && <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">No assignments yet.</div>}
  </div>
);

export default AssignmentList;
