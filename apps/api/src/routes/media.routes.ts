import { Router } from 'express';
import * as tmdb from '../services/tmdb.service';
import * as anilist from '../services/anilist.service';
import { ApiError } from '../middleware/error-handler';

export const mediaRouter = Router();

mediaRouter.get('/search', async (req, res, next) => {
  try {
    const query = String(req.query.q ?? '').trim();
    if (!query) throw new ApiError(400, 'Query parameter "q" is required.');

    const [screenResults, mangaResults] = await Promise.all([
      tmdb.searchMulti(query).catch(() => []),
      anilist.searchManga(query).catch(() => []),
    ]);

    res.json({ results: [...screenResults, ...mangaResults] });
  } catch (err) {
    next(err);
  }
});

mediaRouter.get('/trending', async (_req, res, next) => {
  try {
    const results = await tmdb.trending();
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

mediaRouter.get('/discover/:kind', async (req, res, next) => {
  try {
    const kind = req.params.kind as 'movie' | 'tv' | 'anime' | 'documentary' | 'telenovela' | 'manga';
    if (kind === 'manga') {
      const results = await anilist.trendingManga();
      return res.json({ results });
    }
    if (!['movie', 'tv', 'anime', 'documentary', 'telenovela'].includes(kind)) {
      throw new ApiError(400, 'Unsupported category.');
    }
    const results = await tmdb.discover(kind);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

mediaRouter.get('/detail/:type/:id', async (req, res, next) => {
  try {
    const type = req.params.type as 'movie' | 'tv';
    const id = Number(req.params.id);
    if (!['movie', 'tv'].includes(type) || Number.isNaN(id)) {
      throw new ApiError(400, 'Invalid media reference.');
    }
    const detail = await tmdb.getDetail(id, type);
    res.json(detail);
  } catch (err) {
    next(err);
  }
});
