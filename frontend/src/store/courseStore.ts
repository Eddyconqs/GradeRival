import { create } from 'zustand';
import {
  addAssignmentRequest,
  createCourseRequest,
  deleteAssignmentRequest,
  deleteCourseRequest,
  getAssignmentsRequest,
  getCoursesRequest,
  getCourseStatsRequest,
  updateAssignmentRequest,
  updateCourseRequest
} from '../api/courses';
import { mockAssignments, mockCourses, mockStatsByCourse } from '../data/mockData';
import { buildCourseStats, summarizeCourses } from '../utils/grades';
import { Assignment, Course, CourseStats } from '../types';

interface CourseStore {
  courses: Course[];
  assignmentsByCourse: Record<string, Assignment[]>;
  selectedCourse: Course | null;
  selectedStats: CourseStats | null;
  isLoading: boolean;
  error: string | null;
  loadCourses: () => Promise<void>;
  selectCourse: (courseId: string) => Promise<void>;
  createCourse: (payload: Partial<Course>) => Promise<void>;
  updateCourse: (courseId: string, payload: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addAssignment: (courseId: string, payload: Partial<Assignment>) => Promise<void>;
  updateAssignment: (courseId: string, assignmentId: string, payload: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (courseId: string, assignmentId: string) => Promise<void>;
}

const refreshDerivedData = (courses: Course[], assignmentsByCourse: Record<string, Assignment[]>) => ({
  courses: summarizeCourses(courses, assignmentsByCourse),
  assignmentsByCourse
});

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: mockCourses,
  assignmentsByCourse: mockAssignments,
  selectedCourse: null,
  selectedStats: null,
  isLoading: false,
  error: null,
  loadCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await getCoursesRequest();
      const assignmentEntries = await Promise.all(
        courses.map(async (course) => [course.id, await getAssignmentsRequest(course.id)] as const)
      );
      const assignmentsByCourse = Object.fromEntries(assignmentEntries);
      set({ ...refreshDerivedData(courses, assignmentsByCourse), isLoading: false });
    } catch {
      set({ courses: mockCourses, assignmentsByCourse: mockAssignments, isLoading: false, error: 'Showing demo course data.' });
    }
  },
  selectCourse: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const course = get().courses.find((entry) => entry.id === courseId) ?? null;
      const assignments = await getAssignmentsRequest(courseId);
      const stats = await getCourseStatsRequest(courseId);
      set({
        selectedCourse: course ? { ...course, currentGrade: stats.currentGrade, projectedGrade: stats.projectedGrade } : null,
        selectedStats: stats,
        assignmentsByCourse: { ...get().assignmentsByCourse, [courseId]: assignments },
        isLoading: false
      });
    } catch {
      const course = get().courses.find((entry) => entry.id === courseId) ?? mockCourses[0];
      set({
        selectedCourse: course,
        selectedStats: mockStatsByCourse[courseId] ?? buildCourseStats(mockAssignments[courseId] ?? []),
        isLoading: false,
        error: 'Showing demo course details.'
      });
    }
  },
  createCourse: async (payload) => {
    try {
      const created = await createCourseRequest(payload);
      const baseCourses = [...get().courses, created];
      set(refreshDerivedData(baseCourses, { ...get().assignmentsByCourse, [created.id]: [] }));
    } catch {
      const created: Course = {
        id: `local-course-${Date.now()}`,
        userId: 'user-demo',
        name: payload.name ?? 'New Course',
        code: payload.code ?? 'NEW-101',
        instructor: payload.instructor,
        credits: Number(payload.credits ?? 1),
        semester: payload.semester ?? 'Fall',
        year: Number(payload.year ?? new Date().getFullYear()),
        gradingScale: payload.gradingScale ?? 'percentage',
        targetGrade: payload.targetGrade,
        color: payload.color ?? '#8b5cf6',
        createdAt: new Date().toISOString()
      };
      const baseCourses = [...get().courses, created];
      set({ ...refreshDerivedData(baseCourses, { ...get().assignmentsByCourse, [created.id]: [] }), error: 'Course saved in demo mode.' });
    }
  },
  updateCourse: async (courseId, payload) => {
    try {
      await updateCourseRequest(courseId, payload);
    } catch {
      set({ error: 'Updated locally because the API is unavailable.' });
    }
    const baseCourses = get().courses.map((course) => (course.id === courseId ? { ...course, ...payload } : course));
    set(refreshDerivedData(baseCourses, get().assignmentsByCourse));
  },
  deleteCourse: async (courseId) => {
    try {
      await deleteCourseRequest(courseId);
    } catch {
      set({ error: 'Deleted locally because the API is unavailable.' });
    }
    const baseCourses = get().courses.filter((course) => course.id !== courseId);
    const nextAssignments = { ...get().assignmentsByCourse };
    delete nextAssignments[courseId];
    set(refreshDerivedData(baseCourses, nextAssignments));
  },
  addAssignment: async (courseId, payload) => {
    let assignment: Assignment;
    try {
      assignment = await addAssignmentRequest(courseId, payload);
    } catch {
      assignment = {
        id: `local-assignment-${Date.now()}`,
        courseId,
        name: payload.name ?? 'New Assignment',
        category: payload.category ?? 'Homework',
        weight: Number(payload.weight ?? 0),
        earnedPoints: payload.earnedPoints,
        totalPoints: Number(payload.totalPoints ?? 100),
        dueDate: payload.dueDate,
        submitted: Boolean(payload.submitted),
        createdAt: new Date().toISOString()
      };
      set({ error: 'Assignment saved in demo mode.' });
    }
    const nextAssignments = {
      ...get().assignmentsByCourse,
      [courseId]: [...(get().assignmentsByCourse[courseId] ?? []), assignment]
    };
    set({ ...refreshDerivedData(get().courses, nextAssignments), selectedStats: buildCourseStats(nextAssignments[courseId]) });
  },
  updateAssignment: async (courseId, assignmentId, payload) => {
    try {
      await updateAssignmentRequest(courseId, assignmentId, payload);
    } catch {
      set({ error: 'Updated locally because the API is unavailable.' });
    }
    const nextAssignments = {
      ...get().assignmentsByCourse,
      [courseId]: (get().assignmentsByCourse[courseId] ?? []).map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, ...payload } : assignment
      )
    };
    set({ ...refreshDerivedData(get().courses, nextAssignments), selectedStats: buildCourseStats(nextAssignments[courseId]) });
  },
  deleteAssignment: async (courseId, assignmentId) => {
    try {
      await deleteAssignmentRequest(courseId, assignmentId);
    } catch {
      set({ error: 'Deleted locally because the API is unavailable.' });
    }
    const nextAssignments = {
      ...get().assignmentsByCourse,
      [courseId]: (get().assignmentsByCourse[courseId] ?? []).filter((assignment) => assignment.id !== assignmentId)
    };
    set({ ...refreshDerivedData(get().courses, nextAssignments), selectedStats: buildCourseStats(nextAssignments[courseId]) });
  }
}));
