import { Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { db } from '../data/store';
import { requireAuth } from '../middleware/auth';
import { Assignment, AuthRequest, Course } from '../types';
import {
  calculateCategoryBreakdown,
  calculateCurrentGrade,
  calculateNeededScore,
  calculateProjectedGrade
} from '../utils/grades';

const router = Router();

router.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));
router.use(requireAuth);

const getUserCourse = (userId: string, courseId: string) => db.courses.find((course) => course.userId === userId && course.id === courseId);

router.get('/', (request: AuthRequest, response: Response) => {
  const courses = db.courses.filter((course) => course.userId === request.user?.id);
  const result = courses.map((course) => {
    const courseAssignments = db.assignments.filter((assignment) => assignment.courseId === course.id);
    return {
      ...course,
      currentGrade: calculateCurrentGrade(courseAssignments),
      projectedGrade: calculateProjectedGrade(courseAssignments),
      assignmentsCount: courseAssignments.length
    };
  });

  return response.json(result);
});

router.post(
  '/',
  [body('name').isString(), body('code').isString(), body('semester').isString(), body('year').isInt()],
  (request: AuthRequest, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: 'Invalid course data.', errors: errors.array() });
    }

    const payload = request.body as Partial<Course>;
    const course: Course = {
      id: db.nextId('course'),
      userId: request.user!.id,
      name: payload.name!,
      code: payload.code!,
      instructor: payload.instructor,
      credits: Number(payload.credits ?? 1),
      semester: payload.semester!,
      year: Number(payload.year),
      gradingScale: payload.gradingScale ?? 'percentage',
      targetGrade: payload.targetGrade,
      color: payload.color ?? '#8b5cf6',
      createdAt: new Date().toISOString()
    };

    db.courses.push(course);
    return response.status(201).json(course);
  }
);

router.put('/:id', [param('id').isString()], (request: AuthRequest, response: Response) => {
  const courseId = String(request.params.id);
  const course = getUserCourse(request.user!.id, courseId);
  if (!course) {
    return response.status(404).json({ message: 'Course not found.' });
  }

  Object.assign(course, request.body);
  return response.json(course);
});

router.delete('/:id', [param('id').isString()], (request: AuthRequest, response: Response) => {
  const courseId = String(request.params.id);
  const index = db.courses.findIndex((course) => course.userId === request.user!.id && course.id === courseId);
  if (index === -1) {
    return response.status(404).json({ message: 'Course not found.' });
  }

  const [deletedCourse] = db.courses.splice(index, 1);
  for (let cursor = db.assignments.length - 1; cursor >= 0; cursor -= 1) {
    if (db.assignments[cursor].courseId === deletedCourse.id) {
      db.assignments.splice(cursor, 1);
    }
  }

  return response.json({ message: 'Course deleted.' });
});

router.get('/:id/assignments', (request: AuthRequest, response: Response) => {
  const courseId = String(request.params.id);
  const course = getUserCourse(request.user!.id, courseId);
  if (!course) {
    return response.status(404).json({ message: 'Course not found.' });
  }

  return response.json(db.assignments.filter((assignment) => assignment.courseId === course.id));
});

router.post(
  '/:id/assignments',
  [body('name').isString(), body('category').isString(), body('totalPoints').isNumeric()],
  (request: AuthRequest, response: Response) => {
    const courseId = String(request.params.id);
    const course = getUserCourse(request.user!.id, courseId);
    if (!course) {
      return response.status(404).json({ message: 'Course not found.' });
    }

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: 'Invalid assignment data.', errors: errors.array() });
    }

    const payload = request.body as Partial<Assignment>;
    const assignment: Assignment = {
      id: db.nextId('assignment'),
      courseId: course.id,
      name: payload.name!,
      category: payload.category!,
      weight: Number(payload.weight ?? 0),
      earnedPoints: payload.earnedPoints === undefined ? undefined : Number(payload.earnedPoints),
      totalPoints: Number(payload.totalPoints),
      dueDate: payload.dueDate,
      submitted: Boolean(payload.submitted),
      createdAt: new Date().toISOString()
    };

    db.assignments.push(assignment);
    return response.status(201).json(assignment);
  }
);

router.put('/:id/assignments/:assignmentId', (request: AuthRequest, response: Response) => {
  const courseId = String(request.params.id);
  const course = getUserCourse(request.user!.id, courseId);
  if (!course) {
    return response.status(404).json({ message: 'Course not found.' });
  }

  const assignment = db.assignments.find(
    (entry) => entry.courseId === course.id && entry.id === request.params.assignmentId
  );

  if (!assignment) {
    return response.status(404).json({ message: 'Assignment not found.' });
  }

  Object.assign(assignment, request.body);
  return response.json(assignment);
});

router.delete('/:id/assignments/:assignmentId', (request: AuthRequest, response: Response) => {
  const courseId = String(request.params.id);
  const index = db.assignments.findIndex(
    (entry) => entry.courseId === courseId && entry.id === String(request.params.assignmentId)
  );

  if (index === -1) {
    return response.status(404).json({ message: 'Assignment not found.' });
  }

  db.assignments.splice(index, 1);
  return response.json({ message: 'Assignment deleted.' });
});

router.get('/:id/stats', (request: AuthRequest, response: Response) => {
  const courseId = String(request.params.id);
  const course = getUserCourse(request.user!.id, courseId);
  if (!course) {
    return response.status(404).json({ message: 'Course not found.' });
  }

  const courseAssignments = db.assignments.filter((assignment) => assignment.courseId === course.id);
  const currentGrade = calculateCurrentGrade(courseAssignments);
  const projectedGrade = calculateProjectedGrade(courseAssignments);
  const categoryBreakdown = calculateCategoryBreakdown(courseAssignments);
  const neededForA = calculateNeededScore(courseAssignments, 90, 100);

  return response.json({
    currentGrade,
    projectedGrade,
    neededForA,
    completedAssignments: courseAssignments.filter((assignment) => assignment.submitted).length,
    totalAssignments: courseAssignments.length,
    categoryBreakdown,
    trend: courseAssignments
      .filter((assignment) => typeof assignment.earnedPoints === 'number')
      .map((assignment) => ({
        label: assignment.name,
        grade: Number((((assignment.earnedPoints ?? 0) / assignment.totalPoints) * 100).toFixed(2))
      }))
  });
});

export default router;
