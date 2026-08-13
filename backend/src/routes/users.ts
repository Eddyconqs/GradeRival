import { Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { db } from '../data/store';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const allowedAvatarTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

router.use(rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false }));
router.use(requireAuth);

router.get('/profile', (request: AuthRequest, response: Response) => {
  const user = db.users.find((entry) => entry.id === request.user!.id);
  if (!user) {
    return response.status(404).json({ message: 'Profile not found.' });
  }

  const { password, ...profile } = user;
  return response.json(profile);
});

router.put(
  '/profile',
  upload.single('avatar'),
  [body('username').optional().isString(), body('school').optional().isString(), body('bio').optional().isString()],
  (request: AuthRequest, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: 'Invalid profile update.', errors: errors.array() });
    }

    const user = db.users.find((entry) => entry.id === request.user!.id);
    if (!user) {
      return response.status(404).json({ message: 'Profile not found.' });
    }

    if (request.body.username && db.users.some((entry) => entry.username === request.body.username && entry.id !== user.id)) {
      return response.status(409).json({ message: 'Username is already taken.' });
    }

    if (request.file && !allowedAvatarTypes.has(request.file.mimetype)) {
      return response.status(400).json({ message: 'Avatar must be a JPEG, PNG, WEBP, or GIF image.' });
    }

    user.username = request.body.username ?? user.username;
    user.school = request.body.school ?? user.school;
    user.bio = request.body.bio ?? user.bio;
    user.graduationYear = request.body.graduationYear ? Number(request.body.graduationYear) : user.graduationYear;
    user.avatar = request.file
      ? `data:${request.file.mimetype};base64,${request.file.buffer.toString('base64')}`
      : request.body.avatar ?? user.avatar;
    user.updatedAt = new Date().toISOString();

    const { password, ...profile } = user;
    return response.json(profile);
  }
);

export default router;
