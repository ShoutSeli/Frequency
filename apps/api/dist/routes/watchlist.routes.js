"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchlistRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const require_auth_1 = require("../middleware/require-auth");
const error_handler_1 = require("../middleware/error-handler");
exports.watchlistRouter = (0, express_1.Router)();
exports.watchlistRouter.use(require_auth_1.requireAuth);
exports.watchlistRouter.get('/', async (req, res, next) => {
    try {
        const entries = await prisma_1.prisma.watchlistEntry.findMany({
            where: { userId: req.userId },
            orderBy: { updatedAt: 'desc' },
        });
        res.json({ entries });
    }
    catch (err) {
        next(err);
    }
});
const upsertSchema = zod_1.z.object({
    mediaId: zod_1.z.string(),
    mediaKind: zod_1.z.enum([
        'movie', 'tv', 'anime', 'manga', 'documentary', 'telenovela', 'music', 'sport', 'live_tv', 'radio',
    ]),
    title: zod_1.z.string(),
    posterUrl: zod_1.z.string().optional(),
    status: zod_1.z.enum(['planned', 'in_progress', 'completed', 'dropped']).default('planned'),
    progressNote: zod_1.z.string().optional(),
});
exports.watchlistRouter.post('/', async (req, res, next) => {
    try {
        const parsed = upsertSchema.safeParse(req.body);
        if (!parsed.success)
            throw new error_handler_1.ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
        const entry = await prisma_1.prisma.watchlistEntry.upsert({
            where: { userId_mediaId: { userId: req.userId, mediaId: parsed.data.mediaId } },
            update: { ...parsed.data },
            create: { ...parsed.data, userId: req.userId },
        });
        res.status(201).json(entry);
    }
    catch (err) {
        next(err);
    }
});
exports.watchlistRouter.patch('/:id', async (req, res, next) => {
    try {
        const existing = await prisma_1.prisma.watchlistEntry.findUnique({ where: { id: req.params.id } });
        if (!existing || existing.userId !== req.userId)
            throw new error_handler_1.ApiError(404, 'Watchlist entry not found.');
        const partialSchema = upsertSchema.partial();
        const parsed = partialSchema.safeParse(req.body);
        if (!parsed.success)
            throw new error_handler_1.ApiError(400, 'Invalid input.');
        const updated = await prisma_1.prisma.watchlistEntry.update({ where: { id: req.params.id }, data: parsed.data });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.watchlistRouter.delete('/:id', async (req, res, next) => {
    try {
        const existing = await prisma_1.prisma.watchlistEntry.findUnique({ where: { id: req.params.id } });
        if (!existing || existing.userId !== req.userId)
            throw new error_handler_1.ApiError(404, 'Watchlist entry not found.');
        await prisma_1.prisma.watchlistEntry.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
