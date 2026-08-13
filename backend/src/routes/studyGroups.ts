import { Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { db } from '../data/store';
import { requireAuth } from '../middleware/auth';
import { AuthRequest, GroupMember, StudyGroup } from '../types';

const router = Router();

router.use(rateLimit({ windowMs: 60_000, max: 90, standardHeaders: true, legacyHeaders: false }));
router.use(requireAuth);

router.get('/', (request: AuthRequest, response: Response) => {
  const groups = db.studyGroups.map((group) => ({
    ...group,
    memberCount: db.groupMembers.filter((member) => member.groupId === group.id).length,
    joined: db.groupMembers.some((member) => member.groupId === group.id && member.userId === request.user!.id)
  }));

  return response.json(groups);
});

router.post(
  '/',
  [body('name').isString(), body('code').isString(), body('maxMembers').optional().isInt({ min: 2 })],
  (request: AuthRequest, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: 'Invalid study group data.', errors: errors.array() });
    }

    if (db.studyGroups.some((group) => group.code === request.body.code)) {
      return response.status(409).json({ message: 'That study group code is already in use.' });
    }

    const group: StudyGroup = {
      id: db.nextId('group'),
      name: request.body.name,
      description: request.body.description,
      code: request.body.code,
      isPublic: request.body.isPublic ?? true,
      maxMembers: Number(request.body.maxMembers ?? 12),
      createdAt: new Date().toISOString()
    };

    db.studyGroups.push(group);
    const membership: GroupMember = {
      id: db.nextId('member'),
      groupId: group.id,
      userId: request.user!.id,
      role: 'OWNER',
      joinedAt: new Date().toISOString()
    };
    db.groupMembers.push(membership);

    return response.status(201).json(group);
  }
);

router.post('/join', [body('code').isString()], (request: AuthRequest, response: Response) => {
  const group = db.studyGroups.find((entry) => entry.code.toLowerCase() === String(request.body.code).toLowerCase());
  if (!group) {
    return response.status(404).json({ message: 'Study group not found.' });
  }

  const memberCount = db.groupMembers.filter((member) => member.groupId === group.id).length;
  if (memberCount >= group.maxMembers) {
    return response.status(400).json({ message: 'Study group is full.' });
  }

  if (db.groupMembers.some((member) => member.groupId === group.id && member.userId === request.user!.id)) {
    return response.status(200).json({ message: 'Already joined.', group });
  }

  db.groupMembers.push({
    id: db.nextId('member'),
    groupId: group.id,
    userId: request.user!.id,
    role: 'MEMBER',
    joinedAt: new Date().toISOString()
  });

  return response.json({ message: 'Joined study group successfully.', group });
});

export default router;
