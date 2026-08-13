import { Link } from 'react-router-dom';
import { Course } from '../types';

const CourseCard = ({ course }: { course: Course }) => (
  <Link to={`/courses/${course.id}`} className="glass-card block overflow-hidden p-5 transition hover:-translate-y-1 hover:bg-white/10">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${course.color}22`, color: course.color }}>
          {course.code}
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">{course.name}</h3>
        <p className="mt-1 text-sm text-slate-300">{course.instructor ?? 'Independent Study'} • {course.semester} {course.year}</p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-black text-white">{course.currentGrade?.toFixed(1) ?? '0.0'}%</p>
        <p className="text-sm text-slate-400">Projected {course.projectedGrade?.toFixed(1) ?? '0.0'}%</p>
      </div>
    </div>
    <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
      <span>{course.assignmentsCount ?? 0} assignments</span>
      <span>Target {course.targetGrade ?? 'A'}</span>
    </div>
  </Link>
);

export default CourseCard;
