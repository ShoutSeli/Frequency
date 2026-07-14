import { Router } from 'express';
import { z } from 'zod';
import { mixMood } from '../services/mood-mixer.service';
import { getTimeCapsule } from '../services/time-capsule.service';
import { ApiError } from '../middleware/error-handler';

export const discoveryRouter = Router();

const moodSchema = z.object({
  cozyToIntense: z.number().min(0).max(100),
  shortToEpic: z.number().min(0).max(100),
  backgroundToFocused: z.number().min(0).max(100),
  kinds: z.array(z.enum(['movie', 'tv'])).optional(),
});

discoveryRouter.post('/mood-mixer', async (req, res, next) => {
  try {
    const parsed = moodSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
    const results = await mixMood(parsed.data);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

discoveryRouter.get('/time-capsule', async (req, res, next) => {
  try {
    const date = String(req.query.date ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ApiError(400, 'Query parameter "date" must be in YYYY-MM-DD format.');
    }
    const capsule = await getTimeCapsule(date);
    res.json(capsule);
  } catch (err) {
    next(err);
  }
});
