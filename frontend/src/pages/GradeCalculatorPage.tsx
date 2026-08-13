import { useEffect, useMemo, useState } from 'react';
import { useCourseStore } from '../store/courseStore';
import { calculateNeededScore } from '../utils/grades';

const GradeCalculatorPage = () => {
  const { courses, assignmentsByCourse, loadCourses } = useCourseStore();
  const [courseId, setCourseId] = useState('');
  const [hypotheticalEarned, setHypotheticalEarned] = useState(85);
  const [hypotheticalTotal, setHypotheticalTotal] = useState(100);
  const [targetGrade, setTargetGrade] = useState(93);
  const [finalPoints, setFinalPoints] = useState(100);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (!courseId && courses[0]) setCourseId(courses[0].id);
  }, [courseId, courses]);

  const course = courses.find((entry) => entry.id === courseId) ?? courses[0];
  const assignments = assignmentsByCourse[course?.id ?? ''] ?? [];

  const currentGrade = course?.currentGrade ?? 0;
  const projectedWithWhatIf = useMemo(() => {
    if (!course) return 0;
    const totalEarned = assignments.reduce((sum, assignment) => sum + (assignment.earnedPoints ?? 0), 0) + hypotheticalEarned;
    const totalPossible = assignments.reduce((sum, assignment) => sum + assignment.totalPoints, 0) + hypotheticalTotal;
    return totalPossible ? Number(((totalEarned / totalPossible) * 100).toFixed(2)) : 0;
  }, [assignments, course, hypotheticalEarned, hypotheticalTotal]);

  const neededScore = useMemo(
    () => calculateNeededScore(assignments, targetGrade, finalPoints),
    [assignments, finalPoints, targetGrade]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Grade calculator</p>
        <h1 className="mt-2 text-3xl font-black text-white">Run what-if scenarios before the next score lands.</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Course</span>
              <select className="field" value={course?.id ?? ''} onChange={(event) => setCourseId(event.target.value)}>
                {courses.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Hypothetical score</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="field" type="number" value={hypotheticalEarned} onChange={(event) => setHypotheticalEarned(Number(event.target.value))} />
                <input className="field" type="number" value={hypotheticalTotal} onChange={(event) => setHypotheticalTotal(Number(event.target.value))} />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Target final grade</span>
              <input className="field" type="number" value={targetGrade} onChange={(event) => setTargetGrade(Number(event.target.value))} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Final assessment points available</span>
              <input className="field" type="number" value={finalPoints} onChange={(event) => setFinalPoints(Number(event.target.value))} />
            </label>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="glass-card p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Current grade</p>
            <p className="mt-3 text-4xl font-black text-white">{currentGrade.toFixed(1)}%</p>
            <p className="mt-2 text-sm text-slate-300">Your present weighted average.</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Projected grade</p>
            <p className="mt-3 text-4xl font-black text-white">{projectedWithWhatIf.toFixed(1)}%</p>
            <p className="mt-2 text-sm text-slate-300">If you earn the hypothetical score above.</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Score needed</p>
            <p className="mt-3 text-4xl font-black text-white">{neededScore.toFixed(1)}</p>
            <p className="mt-2 text-sm text-slate-300">Points needed on the final to reach your target grade.</p>
          </div>
          <div className="glass-card p-5 sm:col-span-3">
            <h3 className="section-title">Interpretation</h3>
            <p className="mt-3 text-slate-300">
              To reach <span className="font-semibold text-white">{targetGrade}%</span> in <span className="font-semibold text-white">{course?.name ?? 'this course'}</span>, you need <span className="font-semibold text-white">{neededScore.toFixed(1)} / {finalPoints}</span> on the final assessment. The what-if scenario above updates your projected course average in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeCalculatorPage;
