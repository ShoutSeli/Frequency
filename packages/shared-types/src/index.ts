// ============================================================
// Shared types — single source of truth for API <-> Web contracts
// ============================================================

export type MediaKind =
  | 'movie'
  | 'tv'
  | 'anime'
  | 'manga'
  | 'documentary'
  | 'telenovela'
  | 'music'
  | 'sport'
  | 'live_tv'
  | 'radio';

export interface WatchProvider {
  id: number;
  name: string;
  logoUrl: string;
  type: 'stream' | 'rent' | 'buy' | 'free';
  deepLinkUrl?: string;
}

export interface MediaItem {
  id: string; // provider-prefixed id, e.g. "tmdb-movie-603"
  kind: MediaKind;
  title: string;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseYear?: number;
  rating?: number; // 0-10 normalized
  genres?: string[];
  country?: string;
  language?: string;
  runtimeMinutes?: number;
  providers?: WatchProvider[];
  externalUrl?: string; // for radio/live tv direct stream/deep-link
}

export interface SportEvent {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'final';
  startTime: string; // ISO
  venue?: string;
  broadcastProviders?: WatchProvider[];
}

export interface RadioStation {
  id: string;
  name: string;
  country: string;
  language?: string;
  tags: string[];
  streamUrl: string;
  favicon?: string;
  bitrate?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

export type WatchlistStatus = 'planned' | 'in_progress' | 'completed' | 'dropped';

export interface WatchlistEntry {
  id: string;
  userId: string;
  mediaId: string;
  mediaKind: MediaKind;
  title: string;
  posterUrl?: string;
  status: WatchlistStatus;
  progressNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userDisplayName: string;
  mediaId: string;
  mediaKind: MediaKind;
  rating: number; // 1-10
  body?: string;
  createdAt: string;
}

export interface CuratedList {
  id: string;
  userId: string;
  ownerDisplayName: string;
  title: string;
  description?: string;
  isPublic: boolean;
  items: { mediaId: string; mediaKind: MediaKind; title: string; posterUrl?: string }[];
  createdAt: string;
}

export interface MoodMixerInput {
  cozyToIntense: number; // 0-100
  shortToEpic: number; // 0-100
  backgroundToFocused: number; // 0-100
  kinds?: MediaKind[];
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface ApiError {
  message: string;
  code?: string;
}
