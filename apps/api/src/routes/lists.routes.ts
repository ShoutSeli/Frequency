import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, optionalAuth, AuthedRequest } from '../middleware/require-auth';
import { ApiError } from '../middleware/error-handler';

export const listsRouter = Router();

const listItemSchema = z.object({
  mediaId: z.string(),
  mediaKind: z.enum([
    'movie', 'tv', 'anime', 'manga', 'documentary', 'telenovela', 'music', 'sport', 'live_tv', 'radio',
  ]),
  title: z.string(),
  posterUrl: z.string().optional(),
});

const createListSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  items: z.array(listItemSchema).default([]),
});

listsRouter.get('/', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const mine = req.query.mine === 'true';
    const lists = await prisma.curatedList.findMany({
      where: mine && req.userId ? { userId: req.userId } : { isPublic: true },
      include: { user: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({
      lists: lists.map((l: (typeof lists)[number]) => ({
        id: l.id,
        userId: l.userId,
        ownerDisplayName: l.user.displayName,
        title: l.title,
        description: l.description,
        isPublic: l.isPublic,
        items: l.items,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

listsRouter.post('/', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = createListSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
    const list = await prisma.curatedList.create({
      data: {
        userId: req.userId!,
        title: parsed.data.title,
        description: parsed.data.description,
        isPublic: parsed.data.isPublic,
        items: parsed.data.items,
      },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

listsRouter.delete('/:id', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const existing = await prisma.curatedList.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) throw new ApiError(404, 'List not found.');
    await prisma.curatedList.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
