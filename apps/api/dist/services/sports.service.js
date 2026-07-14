"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsByDate = getEventsByDate;
exports.searchLeague = searchLeague;
exports.getTeamHistory = getTeamHistory;
exports.searchTeam = searchTeam;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../lib/env");
const cache_1 = require("../lib/cache");
// TheSportsDB free tier (key "3") — https://www.thesportsdb.com/api.php
function base() {
    return `https://www.thesportsdb.com/api/v1/json/${env_1.env.sportsDbApiKey || '3'}`;
}
function mapEvent(raw) {
    const status = raw.strStatus === 'Match Finished' || raw.intHomeScore != null
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
async function getEventsByDate(dateISO) {
    return (0, cache_1.withCache)(`sports:date:${dateISO}`, 60 * 5, async () => {
        const { data } = await axios_1.default.get(`${base()}/eventsday.php`, {
            params: { d: dateISO },
            timeout: 8000,
        });
        return (data.events ?? []).map(mapEvent);
    });
}
async function searchLeague(leagueName) {
    return (0, cache_1.withCache)(`sports:league:${leagueName.toLowerCase()}`, 60 * 15, async () => {
        const { data } = await axios_1.default.get(`${base()}/search_all_seasons.php`, {
            params: { l: leagueName },
            timeout: 8000,
        });
        return (data.events ?? []).slice(0, 30).map(mapEvent);
    });
}
/** Historical (old) games for a given team — great for "relive classic games" feature. */
async function getTeamHistory(teamId) {
    return (0, cache_1.withCache)(`sports:team-history:${teamId}`, 60 * 60, async () => {
        const { data } = await axios_1.default.get(`${base()}/eventslast.php`, {
            params: { id: teamId },
            timeout: 8000,
        });
        return (data.results ?? []).map(mapEvent);
    });
}
async function searchTeam(name) {
    return (0, cache_1.withCache)(`sports:team-search:${name.toLowerCase()}`, 60 * 60, async () => {
        const { data } = await axios_1.default.get(`${base()}/searchteams.php`, {
            params: { t: name },
            timeout: 8000,
        });
        return (data.teams ?? []);
    });
}
