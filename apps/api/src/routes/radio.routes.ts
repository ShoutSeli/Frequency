import { Router } from 'express';
import * as radio from '../services/radio.service';
import { ApiError } from '../middleware/error-handler';

export const radioRouter = Router();

radioRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '');
    if (!q) throw new ApiError(400, 'Query parameter "q" is required.');
    const stations = await radio.searchStations(q);
    res.json({ stations });
  } catch (err) {
    next(err);
  }
});

radioRouter.get('/country/:country', async (req, res, next) => {
  try {
    const stations = await radio.stationsByCountry(req.params.country);
    res.json({ stations });
  } catch (err) {
    next(err);
  }
});

radioRouter.get('/top', async (_req, res, next) => {
  try {
    const stations = await radio.topStations();
    res.json({ stations });
  } catch (err) {
    next(err);
  }
});

radioRouter.get('/tag/:tag', async (req, res, next) => {
  try {
    const stations = await radio.stationsByTag(req.params.tag);
    res.json({ stations });
  } catch (err) {
    next(err);
  }
});
