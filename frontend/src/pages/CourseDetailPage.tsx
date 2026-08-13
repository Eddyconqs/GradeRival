import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AssignmentList from '../components/AssignmentList';
import GradeChart from '../components/GradeChart';
import GradeCard from '../components/GradeCard';
import { useCourseStore } from '../store/courseStore';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { selectedCourse, selectedStats, assignmentsByCourse, selectCourse } = useCourseStore();

  useEffect(() => {
    if (id) {
      void selectCourse(id);
    }
  }, [id, selectCourse]);

  const assignments = assignmentsByCourse[id ?? ''] ?? [];
  const completionRate = useMemo(() => {
    if (!selectedStats?.totalAssignments) return 0;
    return (selectedStats.completedAssignments / selectedStats.totalAssignments) * 100;
  }, [selectedStats]);

  if (!selectedCourse || !selectedStats) {
    return <div className="glass-card p-8 text-slate-300">Loading course insights…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${selectedCourse.color}22`, color: selectedCourse.color }}>{selectedCourse.code}</div>
            <h1 className="mt-4 text-3xl font-black text-white">{selectedCourse.name}</h1>
            <p className="mt-2 text-slate-300">{selectedCourse.instructor ?? 'Independent Study'} • {selectedCourse.semester} {selectedCourse.year}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <GradeCard label="Current" value={`${selectedStats.currentGrade.toFixed(1)}%`} helper="Based on graded work" />
            <GradeCard label="Projected" value={`${selectedStats.projectedGrade.toFixed(1)}%`} helper="If current pace holds" />
            <GradeCard label="Completion" value={`${completionRate.toFixed(0)}%`} helper="Assignments submitted" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GradeChart data={selectedStats.trend} />
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Grade breakdown</h3>
            <span className="text-sm text-slate-400">Need {selectedStats.neededForA.toFixed(0)} pts on a 100-point final for a 90%</span>
          </div>
          <div className="space-y-3">
            {selectedStats.categoryBreakdown.map((category) => (
              <div key={category.category} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{category.category}</p>
                    <p className="text-sm text-slate-400">{category.assignments} assignments • Avg weight {category.weight}%</p>
                  </div>
                  <p className="text-xl font-black text-white">{category.grade.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Assignments</h2>
          <span className="text-sm text-slate-400">{assignments.length} tracked items</span>
        </div>
        <AssignmentList assignments={assignments} />
      </div>
    </div>
  );
};

export default CourseDetailPage;
