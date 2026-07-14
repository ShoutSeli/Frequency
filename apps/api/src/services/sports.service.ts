import axios from 'axios';
import { env } from '../lib/env';
import { withCache } from '../lib/cache';
import type { SportEvent } from '@uwh/shared-types';

// TheSportsDB free tier (key "3") — https://www.thesportsdb.com/api.php
function base() {
  return `https://www.thesportsdb.com/api/v1/json/${env.sportsDbApiKey || '3'}`;
}

function mapEvent(raw: any): SportEvent {
  const status: SportEvent['status'] =
    raw.strStatus === 'Match Finished' || raw.intHomeScore != null
      ? raw.strStatus === 'Match Finished'
        ? 'final'
        : 'live'
      : 'scheduled';
  return {
    id: `sportsdb-${raw.idEvent}`,
    league: raw.strLeague,
    homeTeam: raw.strHomeTeam,
    awayTeam: raw.strAwayTeam,
    homeScore: raw.intHomeScore != null ? Number(raw.intHomeScore) : undefined,
    awayScore: raw.intAwayScore != null ? Number(raw.intAwayScore) : undefined,
    status,
    startTime: `${raw.dateEvent ?? ''}T${raw.strTime ?? '00:00:00'}`,
    venue: raw.strVenue,
  };
}

export async function getEventsByDate(dateISO: string): Promise<SportEvent[]> {
  return withCache(`sports:date:${dateISO}`, 60 * 5, async () => {
    const { data } = await axios.get(`${base()}/eventsday.php`, {
      params: { d: dateISO },
      timeout: 8000,
    });
    return ((data.events ?? []) as any[]).map(mapEvent);
  });
}

export async function searchLeague(leagueName: string): Promise<SportEvent[]> {
  return withCache(`sports:league:${leagueName.toLowerCase()}`, 60 * 15, async () => {
    const { data } = await axios.get(`${base()}/search_all_seasons.php`, {
      params: { l: leagueName },
      timeout: 8000,
    });
    return ((data.events ?? []) as any[]).slice(0, 30).map(mapEvent);
  });
}

/** Historical (old) games for a given team — great for "relive classic games" feature. */
export async function getTeamHistory(teamId: string): Promise<SportEvent[]> {
  return withCache(`sports:team-history:${teamId}`, 60 * 60, async () => {
    const { data } = await axios.get(`${base()}/eventslast.php`, {
      params: { id: teamId },
      timeout: 8000,
    });
    return ((data.results ?? []) as any[]).map(mapEvent);
  });
}

export async function searchTeam(name: string) {
  return withCache(`sports:team-search:${name.toLowerCase()}`, 60 * 60, async () => {
    const { data } = await axios.get(`${base()}/searchteams.php`, {
      params: { t: name },
      timeout: 8000,
    });
    return (data.teams ?? []) as any[];
  });
}
