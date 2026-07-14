import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './lib/env';
import { authRouter } from './routes/auth.routes';
import { mediaRouter } from './routes/media.routes';
import { sportsRouter } from './routes/sports.routes';
import { radioRouter } from './routes/radio.routes';
import { musicRouter } from './routes/music.routes';
import { discoveryRouter } from './routes/discovery.routes';
import { watchlistRouter } from './routes/watchlist.routes';
import { reviewsRouter } from './routes/reviews.routes';
import { listsRouter } from './routes/lists.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRouter);
app.use('/api/media', mediaRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/radio', radioRouter);
app.use('/api/music', musicRouter);
app.use('/api/discovery', discoveryRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/lists', listsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 Universal Watch Hub API listening on http://localhost:${env.port}`);
});
