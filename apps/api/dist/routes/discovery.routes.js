"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoveryRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const mood_mixer_service_1 = require("../services/mood-mixer.service");
const time_capsule_service_1 = require("../services/time-capsule.service");
const error_handler_1 = require("../middleware/error-handler");
exports.discoveryRouter = (0, express_1.Router)();
const moodSchema = zod_1.z.object({
    cozyToIntense: zod_1.z.number().min(0).max(100),
    shortToEpic: zod_1.z.number().min(0).max(100),
    backgroundToFocused: zod_1.z.number().min(0).max(100),
    kinds: zod_1.z.array(zod_1.z.enum(['movie', 'tv'])).optional(),
});
exports.discoveryRouter.post('/mood-mixer', async (req, res, next) => {
    try {
        const parsed = moodSchema.safeParse(req.body);
        if (!parsed.success)
            throw new error_handler_1.ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
        const results = await (0, mood_mixer_service_1.mixMood)(parsed.data);
        res.json({ results });
    }
    catch (err) {
        next(err);
    }
});
exports.discoveryRouter.get('/time-capsule', async (req, res, next) => {
    try {
        const date = String(req.query.date ?? '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new error_handler_1.ApiError(400, 'Query parameter "date" must be in YYYY-MM-DD format.');
        }
        const capsule = await (0, time_capsule_service_1.getTimeCapsule)(date);
        res.json(capsule);
    }
    catch (err) {
        next(err);
    }
});
