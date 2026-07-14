import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/require-auth';
import { ApiError } from '../middleware/error-handler';

export const watchlistRouter = Router();
watchlistRouter.use(requireAuth);

watchlistRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const entries = await prisma.watchlistEntry.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

const upsertSchema = z.object({
  mediaId: z.string(),
  mediaKind: z.enum([
    'movie', 'tv', 'anime', 'manga', 'documentary', 'telenovela', 'music', 'sport', 'live_tv', 'radio',
  ]),
  title: z.string(),
  posterUrl: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']).default('planned'),
  progressNote: z.string().optional(),
});

watchlistRouter.post('/', async (req: AuthedRequest, res, next) => {
  try {
    const parsed = upsertSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
    const entry = await prisma.watchlistEntry.upsert({
      where: { userId_mediaId: { userId: req.userId!, mediaId: parsed.data.mediaId } },
      update: { ...parsed.data },
      create: { ...parsed.data, userId: req.userId! },
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

watchlistRouter.patch('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const existing = await prisma.watchlistEntry.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) throw new ApiError(404, 'Watchlist entry not found.');

    const partialSchema = upsertSchema.partial();
    const parsed = partialSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'Invalid input.');

    const updated = await prisma.watchlistEntry.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

watchlistRouter.delete('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const existing = await prisma.watchlistEntry.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) throw new ApiError(404, 'Watchlist entry not found.');
    await prisma.watchlistEntry.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
