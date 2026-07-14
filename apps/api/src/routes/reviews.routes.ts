import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/require-auth';
import { ApiError } from '../middleware/error-handler';

export const reviewsRouter = Router();

reviewsRouter.get('/media/:mediaId', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { mediaId: req.params.mediaId },
      include: { user: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      reviews: reviews.map((r: (typeof reviews)[number]) => ({
        id: r.id,
        userId: r.userId,
        userDisplayName: r.user.displayName,
        mediaId: r.mediaId,
        mediaKind: r.mediaKind,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  mediaId: z.string(),
  mediaKind: z.enum([
    'movie', 'tv', 'anime', 'manga', 'documentary', 'telenovela', 'music', 'sport', 'live_tv', 'radio',
  ]),
  rating: z.number().int().min(1).max(10),
  body: z.string().max(2000).optional(),
});

reviewsRouter.post('/', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
    const review = await prisma.review.create({ data: { ...parsed.data, userId: req.userId! } });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

reviewsRouter.delete('/:id', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) throw new ApiError(404, 'Review not found.');
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
