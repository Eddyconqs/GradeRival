import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { db } from '../data/store';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { User } from '../types';

const router = Router();
router.use(rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }));

const sanitizeUser = (user: User) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('username').isLength({ min: 3 }),
    body('name').optional().isString(),
    body('school').optional().isString()
  ],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ message: 'Invalid registration data.', errors: errors.array() });
    }

    const { email, password, username, school, name } = request.body as {
      email: string;
      password: string;
      username: string;
      school?: string;
      name?: string;
    };

    const exists = db.users.find((user) => user.email === email || user.username === username);
    if (exists) {
      return response.status(409).json({ message: 'An account with that email or username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: db.nextId('user'),
      email,
      password: hashedPassword,
      username,
      bio: name ? `${name}'s GradeRival profile` : undefined,
      school,
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(user);

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    db.refreshTokens.set(refreshToken, user.id);

    return response.status(201).json({
      message: 'Registration successful.',
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });
  }
);

router.post('/login', [body('email').isEmail(), body('password').isString()], async (request: Request, response: Response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ message: 'Invalid login data.', errors: errors.array() });
  }

  const { email, password } = request.body as { email: string; password: string };
  const user = db.users.find((entry) => entry.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return response.status(401).json({ message: 'Incorrect email or password.' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  db.refreshTokens.set(refreshToken, user.id);

  return response.json({
    message: 'Login successful.',
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  });
});

router.post('/refresh', [body('refreshToken').isString()], (request: Request, response: Response) => {
  const { refreshToken } = request.body as { refreshToken: string };

  if (!db.refreshTokens.has(refreshToken)) {
    return response.status(401).json({ message: 'Refresh token not recognized.' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = db.users.find((entry) => entry.id === payload.id);

    if (!user) {
      return response.status(404).json({ message: 'User not found.' });
    }

    const accessToken = signAccessToken(user);
    const nextRefreshToken = signRefreshToken(user);
    db.refreshTokens.delete(refreshToken);
    db.refreshTokens.set(nextRefreshToken, user.id);

    return response.json({ accessToken, refreshToken: nextRefreshToken });
  } catch (error) {
    return response.status(401).json({ message: 'Refresh token expired.' });
  }
});

router.post('/forgot-password', [body('email').isEmail()], (request: Request, response: Response) => {
  const { email } = request.body as { email: string };
  const user = db.users.find((entry) => entry.email === email);

  if (user) {
    db.resetRequests.push({ email, requestedAt: new Date().toISOString() });
  }

  return response.json({
    message: 'If an account exists for that email, a password reset link has been queued.'
  });
});

export default router;
