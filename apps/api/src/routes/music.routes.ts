import { Router } from 'express';
import * as spotify from '../services/spotify.service';
import { ApiError } from '../middleware/error-handler';

export const musicRouter = Router();

musicRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '');
    if (!q) throw new ApiError(400, 'Query parameter "q" is required.');
    const tracks = await spotify.searchTracks(q);
    res.json({ tracks });
  } catch (err) {
    next(err);
  }
});
