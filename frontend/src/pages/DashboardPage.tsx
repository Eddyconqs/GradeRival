import { useEffect, useMemo, useState } from 'react';
import { getAchievementsRequest } from '../api/studyGroups';
import AchievementBadge from '../components/AchievementBadge';
import GpaWidget from '../components/GpaWidget';
import GradeCard from '../components/GradeCard';
import GradeChart from '../components/GradeChart';
import { mockAchievements } from '../data/mockData';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { Achievement } from '../types';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { courses, assignmentsByCourse, loadCourses, isLoading } = useCourseStore();
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    getAchievementsRequest().then(setAchievements).catch(() => setAchievements(mockAchievements));
  }, []);

  const recentTrend = useMemo(
    () =>
      courses.slice(0, 4).map((course) => ({
        label: course.code,
        grade: course.currentGrade ?? 0
      })),
    [courses]
  );

  const upcomingDeadlines = useMemo(
    () =>
      Object.values(assignmentsByCourse)
        .flat()
        .filter((assignment) => assignment.dueDate && !assignment.submitted)
        .sort((a, b) => new Date(a.dueDate ?? '').getTime() - new Date(b.dueDate ?? '').getTime())
        .slice(0, 4),
    [assignmentsByCourse]
  );

  const gpa = useMemo(() => {
    if (!courses.length) return 0;
    const points = courses.reduce((sum, course) => {
      const grade = course.currentGrade ?? 0;
      if (grade >= 93) return sum + 4;
      if (grade >= 90) return sum + 3.7;
      if (grade >= 87) return sum + 3.3;
      if (grade >= 83) return sum + 3;
      if (grade >= 80) return sum + 2.7;
      if (grade >= 77) return sum + 2.3;
      if (grade >= 73) return sum + 2;
      if (grade >= 70) return sum + 1.7;
      return sum + 1;
    }, 0);
    return points / courses.length;
  }, [courses]);

  const averageGrade = useMemo(() => {
    if (!courses.length) return 0;
    return courses.reduce((sum, course) => sum + (course.currentGrade ?? 0), 0) / courses.length;
  }, [courses]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-white">Hey {user?.username ?? 'Scholar'}, your semester is trending up.</h1>
          <p className="mt-3 max-w-2xl text-slate-300">Monitor GPA momentum, recent grades, deadlines, and achievements without leaving the same view.</p>
        </div>
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-emerald-200">
          {isLoading ? 'Refreshing dashboard…' : `${upcomingDeadlines.length} upcoming deadlines this week`}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <GpaWidget gpa={gpa} helper="Calculated from your active course averages." />
        <GradeCard label="Average grade" value={`${averageGrade.toFixed(1)}%`} helper="Across your current classes." />
        <GradeCard label="Active courses" value={String(courses.length)} helper="Keep each course on pace for your target grade." />
        <GradeCard label="Earned badges" value={String(achievements.length)} helper="Momentum boosts from consistency and collaboration." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GradeChart data={recentTrend} />
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Upcoming deadlines</h3>
            <span className="text-sm text-slate-400">Stay ahead</span>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{assignment.name}</p>
                <p className="mt-1 text-sm text-slate-400">{assignment.category}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-brand-200">Due {new Date(assignment.dueDate ?? '').toLocaleDateString()}</p>
              </div>
            ))}
            {!upcomingDeadlines.length && <p className="text-slate-400">No pending deadlines. Nice work.</p>}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Recent achievements</h2>
          <span className="text-sm text-slate-400">Keep stacking wins</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {achievements.slice(0, 3).map((achievement) => <AchievementBadge key={achievement.id} achievement={achievement} />)}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
