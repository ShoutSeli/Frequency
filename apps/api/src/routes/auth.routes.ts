import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/auth-tokens';
import { requireAuth, AuthedRequest } from '../middleware/require-auth';
import { ApiError } from '../middleware/error-handler';
import type { AuthResponse, UserProfile } from '@uwh/shared-types';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  displayName: z.string().min(2).max(40),
});

function toProfile(user: { id: string; email: string; displayName: string; avatarUrl: string | null; plan: string; createdAt: Date }): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? undefined,
    plan: user.plan as 'free' | 'premium',
    createdAt: user.createdAt.toISOString(),
  };
}

authRouter.post('/signup', async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
    }
    const { email, password, displayName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'An account with that email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, displayName } });
    const token = signToken({ userId: user.id });
    const response: AuthResponse = { token, user: toProfile(user) };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, 'Email and password are required.');
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, 'Incorrect email or password.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Incorrect email or password.');

    const token = signToken({ userId: user.id });
    const response: AuthResponse = { token, user: toProfile(user) };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new ApiError(404, 'User not found.');
    res.json(toProfile(user));
  } catch (err) {
    next(err);
  }
});
