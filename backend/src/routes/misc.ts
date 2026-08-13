import { Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { db } from '../data/store';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';
import { generateStudyGuide } from '../utils/openai';
import { calculateCurrentGrade } from '../utils/grades';

const router = Router();
const protectedRateLimit = rateLimit({ windowMs: 60_000, max: 80, standardHeaders: true, legacyHeaders: false });

router.get('/leaderboard', protectedRateLimit, requireAuth, (request: AuthRequest, response: Response) => {
  const acceptedFriendIds = db.friendships
    .filter((friendship) => friendship.status === 'ACCEPTED' && [friendship.requesterId, friendship.receiverId].includes(request.user!.id))
    .flatMap((friendship) => [friendship.requesterId, friendship.receiverId])
    .filter((id, index, ids) => ids.indexOf(id) === index);

  const entries = db.users
    .filter((user) => acceptedFriendIds.includes(user.id) || user.id === request.user!.id)
    .map((user) => {
      const userCourses = db.courses.filter((course) => course.userId === user.id);
      const assignmentGrades = userCourses.map((course) => calculateCurrentGrade(db.assignments.filter((assignment) => assignment.courseId === course.id)));
      const averageGrade = assignmentGrades.length
        ? Number((assignmentGrades.reduce((sum, grade) => sum + grade, 0) / assignmentGrades.length).toFixed(2))
        : 0;

      return {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        averageGrade,
        courses: userCourses.length,
        school: user.school
      };
    })
    .sort((left, right) => right.averageGrade - left.averageGrade)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return response.json(entries);
});

router.get('/achievements', protectedRateLimit, requireAuth, (request: AuthRequest, response: Response) => {
  return response.json(db.achievements.filter((achievement) => achievement.userId === request.user!.id));
});

router.post(
  '/ai/study-guide',
  protectedRateLimit,
  requireAuth,
  [body('courseId').isString(), body('topic').optional().isString()],
  async (request: AuthRequest, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: 'Invalid study guide request.', errors: errors.array() });
    }

    const course = db.courses.find((entry) => entry.id === request.body.courseId && entry.userId === request.user!.id);
    if (!course) {
      return response.status(404).json({ message: 'Course not found.' });
    }

    const courseAssignments = db.assignments.filter((assignment) => assignment.courseId === course.id);
    const content = await generateStudyGuide({ course, assignments: courseAssignments, topic: request.body.topic });
    const guide = {
      id: db.nextId('guide'),
      userId: request.user!.id,
      courseId: course.id,
      content,
      createdAt: new Date().toISOString()
    };

    db.studyGuides.unshift(guide);
    return response.status(201).json(guide);
  }
);

export default router;
