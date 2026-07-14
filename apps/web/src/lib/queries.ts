import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api-client';
import type {
  AuthResponse,
  CuratedList,
  MediaItem,
  MoodMixerInput,
  RadioStation,
  Review,
  SportEvent,
  WatchlistEntry,
} from '@uwh/shared-types';

// ---------- Media ----------
export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => (await api.get<{ results: MediaItem[] }>('/media/search', { params: { q: query } })).data.results,
    enabled: query.trim().length > 1,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: async () => (await api.get<{ results: MediaItem[] }>('/media/trending')).data.results,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDiscover(kind: string) {
  return useQuery({
    queryKey: ['discover', kind],
    queryFn: async () => (await api.get<{ results: MediaItem[] }>(`/media/discover/${kind}`)).data.results,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMediaDetail(type: 'movie' | 'tv' | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ['detail', type, id],
    queryFn: async () => (await api.get<MediaItem>(`/media/detail/${type}/${id}`)).data,
    enabled: !!type && !!id,
  });
}

// ---------- Sports ----------
export function useSportsEvents(date: string) {
  return useQuery({
    queryKey: ['sports', 'events', date],
    queryFn: async () => (await api.get<{ events: SportEvent[] }>('/sports/events', { params: { date } })).data.events,
  });
}

// ---------- Radio ----------
export function useTopRadio() {
  return useQuery({
    queryKey: ['radio', 'top'],
    queryFn: async () => (await api.get<{ stations: RadioStation[] }>('/radio/top')).data.stations,
    staleTime: 1000 * 60 * 30,
  });
}

export function useRadioSearch(query: string) {
  return useQuery({
    queryKey: ['radio', 'search', query],
    queryFn: async () => (await api.get<{ stations: RadioStation[] }>('/radio/search', { params: { q: query } })).data.stations,
    enabled: query.trim().length > 1,
  });
}

// ---------- Mood Mixer ----------
export function useMoodMixer() {
  return useMutation({
    mutationFn: async (input: MoodMixerInput) =>
      (await api.post<{ results: MediaItem[] }>('/discovery/mood-mixer', input)).data.results,
  });
}

// ---------- Time Capsule ----------
export function useTimeCapsule(date: string) {
  return useQuery({
    queryKey: ['time-capsule', date],
    queryFn: async () => (await api.get(`/discovery/time-capsule`, { params: { date } })).data,
    enabled: !!date,
  });
}

// ---------- Auth ----------
export function useLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      (await api.post<AuthResponse>('/auth/login', payload)).data,
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; displayName: string }) =>
      (await api.post<AuthResponse>('/auth/signup', payload)).data,
  });
}

// ---------- Watchlist ----------
export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => (await api.get<{ entries: WatchlistEntry[] }>('/watchlist')).data.entries,
  });
}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<WatchlistEntry> & { mediaId: string; mediaKind: string; title: string }) =>
      (await api.post('/watchlist', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/watchlist/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });
}

// ---------- Reviews ----------
export function useReviews(mediaId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', mediaId],
    queryFn: async () => (await api.get<{ reviews: Review[] }>(`/reviews/media/${mediaId}`)).data.reviews,
    enabled: !!mediaId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { mediaId: string; mediaKind: string; rating: number; body?: string }) =>
      (await api.post('/reviews', payload)).data,
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['reviews', variables.mediaId] }),
  });
}

// ---------- Lists ----------
export function usePublicLists() {
  return useQuery({
    queryKey: ['lists', 'public'],
    queryFn: async () => (await api.get<{ lists: CuratedList[] }>('/lists')).data.lists,
  });
}
