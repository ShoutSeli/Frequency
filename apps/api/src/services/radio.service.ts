import axios from 'axios';
import { withCache } from '../lib/cache';
import type { RadioStation } from '@uwh/shared-types';

// Radio-Browser: free, open, community-maintained directory of legal internet radio streams.
// https://api.radio-browser.info — no API key required.
const RADIO_BROWSER_BASE = 'https://de1.api.radio-browser.info/json';

function mapStation(raw: any): RadioStation {
  return {
    id: raw.stationuuid,
    name: raw.name,
    country: raw.country,
    language: raw.language,
    tags: (raw.tags ?? '').split(',').filter(Boolean),
    streamUrl: raw.url_resolved || raw.url,
    favicon: raw.favicon || undefined,
    bitrate: raw.bitrate,
  };
}

export async function searchStations(query: string, limit = 30): Promise<RadioStation[]> {
  return withCache(`radio:search:${query.toLowerCase()}:${limit}`, 60 * 30, async () => {
    const { data } = await axios.get(`${RADIO_BROWSER_BASE}/stations/search`, {
      params: { name: query, limit, hidebroken: true, order: 'clickcount', reverse: true },
      timeout: 8000,
    });
    return (data as any[]).map(mapStation);
  });
}

export async function stationsByCountry(country: string, limit = 30): Promise<RadioStation[]> {
  return withCache(`radio:country:${country.toLowerCase()}:${limit}`, 60 * 60, async () => {
    const { data } = await axios.get(`${RADIO_BROWSER_BASE}/stations/bycountry/${encodeURIComponent(country)}`, {
      params: { limit, hidebroken: true, order: 'clickcount', reverse: true },
      timeout: 8000,
    });
    return (data as any[]).map(mapStation);
  });
}

export async function topStations(limit = 40): Promise<RadioStation[]> {
  return withCache(`radio:top:${limit}`, 60 * 60, async () => {
    const { data } = await axios.get(`${RADIO_BROWSER_BASE}/stations/topclick/${limit}`, {
      timeout: 8000,
    });
    return (data as any[]).map(mapStation);
  });
}

export async function stationsByTag(tag: string, limit = 30): Promise<RadioStation[]> {
  return withCache(`radio:tag:${tag.toLowerCase()}:${limit}`, 60 * 60, async () => {
    const { data } = await axios.get(`${RADIO_BROWSER_BASE}/stations/bytag/${encodeURIComponent(tag)}`, {
      params: { limit, hidebroken: true, order: 'clickcount', reverse: true },
      timeout: 8000,
    });
    return (data as any[]).map(mapStation);
  });
}
