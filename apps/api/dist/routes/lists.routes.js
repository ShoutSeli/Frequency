"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const require_auth_1 = require("../middleware/require-auth");
const error_handler_1 = require("../middleware/error-handler");
exports.listsRouter = (0, express_1.Router)();
const listItemSchema = zod_1.z.object({
    mediaId: zod_1.z.string(),
    mediaKind: zod_1.z.enum([
        'movie', 'tv', 'anime', 'manga', 'documentary', 'telenovela', 'music', 'sport', 'live_tv', 'radio',
    ]),
    title: zod_1.z.string(),
    posterUrl: zod_1.z.string().optional(),
});
const createListSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(80),
    description: zod_1.z.string().max(500).optional(),
    isPublic: zod_1.z.boolean().default(true),
    items: zod_1.z.array(listItemSchema).default([]),
});
exports.listsRouter.get('/', require_auth_1.optionalAuth, async (req, res, next) => {
    try {
        const mine = req.query.mine === 'true';
        const lists = await prisma_1.prisma.curatedList.findMany({
            where: mine && req.userId ? { userId: req.userId } : { isPublic: true },
            include: { user: { select: { displayName: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({
            lists: lists.map((l) => ({
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
    }
    catch (err) {
        next(err);
    }
});
exports.listsRouter.post('/', require_auth_1.requireAuth, async (req, res, next) => {
    try {
        const parsed = createListSchema.safeParse(req.body);
        if (!parsed.success)
            throw new error_handler_1.ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
        const list = await prisma_1.prisma.curatedList.create({
            data: {
                userId: req.userId,
                title: parsed.data.title,
                description: parsed.data.description,
                isPublic: parsed.data.isPublic,
                items: parsed.data.items,
            },
        });
        res.status(201).json(list);
    }
    catch (err) {
        next(err);
    }
});
exports.listsRouter.delete('/:id', require_auth_1.requireAuth, async (req, res, next) => {
    try {
        const existing = await prisma_1.prisma.curatedList.findUnique({ where: { id: req.params.id } });
        if (!existing || existing.userId !== req.userId)
            throw new error_handler_1.ApiError(404, 'List not found.');
        await prisma_1.prisma.curatedList.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
