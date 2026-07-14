"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const require_auth_1 = require("../middleware/require-auth");
const error_handler_1 = require("../middleware/error-handler");
exports.reviewsRouter = (0, express_1.Router)();
exports.reviewsRouter.get('/media/:mediaId', async (req, res, next) => {
    try {
        const reviews = await prisma_1.prisma.review.findMany({
            where: { mediaId: req.params.mediaId },
            include: { user: { select: { displayName: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            reviews: reviews.map((r) => ({
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
    }
    catch (err) {
        next(err);
    }
});
const createSchema = zod_1.z.object({
    mediaId: zod_1.z.string(),
    mediaKind: zod_1.z.enum([
        'movie', 'tv', 'anime', 'manga', 'documentary', 'telenovela', 'music', 'sport', 'live_tv', 'radio',
    ]),
    rating: zod_1.z.number().int().min(1).max(10),
    body: zod_1.z.string().max(2000).optional(),
});
exports.reviewsRouter.post('/', require_auth_1.requireAuth, async (req, res, next) => {
    try {
        const parsed = createSchema.safeParse(req.body);
        if (!parsed.success)
            throw new error_handler_1.ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
        const review = await prisma_1.prisma.review.create({ data: { ...parsed.data, userId: req.userId } });
        res.status(201).json(review);
    }
    catch (err) {
        next(err);
    }
});
exports.reviewsRouter.delete('/:id', require_auth_1.requireAuth, async (req, res, next) => {
    try {
        const existing = await prisma_1.prisma.review.findUnique({ where: { id: req.params.id } });
        if (!existing || existing.userId !== req.userId)
            throw new error_handler_1.ApiError(404, 'Review not found.');
        await prisma_1.prisma.review.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
