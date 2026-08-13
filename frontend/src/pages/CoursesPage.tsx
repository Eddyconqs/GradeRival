import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { useCourseStore } from '../store/courseStore';

const CoursesPage = () => {
  const { courses, loadCourses, error } = useCourseStore();

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Courses</p>
          <h1 className="mt-2 text-3xl font-black text-white">Every class, one clean overview.</h1>
        </div>
        <Link to="/courses/new" className="btn-primary">Add new course</Link>
      </div>
      {error && <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{error}</div>}
      <div className="grid gap-5 lg:grid-cols-2">
        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );
};

export default CoursesPage;
