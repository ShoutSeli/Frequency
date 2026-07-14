import { Router } from 'express';
import * as sports from '../services/sports.service';
import { ApiError } from '../middleware/error-handler';

export const sportsRouter = Router();

sportsRouter.get('/events', async (req, res, next) => {
  try {
    const date = String(req.query.date ?? new Date().toISOString().slice(0, 10));
    const events = await sports.getEventsByDate(date);
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

sportsRouter.get('/league/:name', async (req, res, next) => {
  try {
    const events = await sports.searchLeague(req.params.name);
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

sportsRouter.get('/team/search', async (req, res, next) => {
  try {
    const name = String(req.query.name ?? '');
    if (!name) throw new ApiError(400, 'Query parameter "name" is required.');
    const teams = await sports.searchTeam(name);
    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

sportsRouter.get('/team/:id/history', async (req, res, next) => {
  try {
    const events = await sports.getTeamHistory(req.params.id);
    res.json({ events });
  } catch (err) {
    next(err);
  }
});
