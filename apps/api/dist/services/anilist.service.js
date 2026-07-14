"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchManga = searchManga;
exports.trendingManga = trendingManga;
const axios_1 = __importDefault(require("axios"));
const cache_1 = require("../lib/cache");
// AniList: free, open GraphQL API for anime/manga metadata (no key required).
// https://anilist.gitbook.io/anilist-apidocs
const ANILIST_URL = 'https://graphql.anilist.co';
const QUERY = `
query ($search: String, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, search: $search, sort: $sort) {
      id
      title { romaji english }
      description(asHtml: false)
      coverImage { extraLarge }
      bannerImage
      averageScore
      startDate { year }
      genres
      countryOfOrigin
    }
  }
}
`;
function mapManga(raw) {
    const title = raw.title.english || raw.title.romaji;
    return {
        id: `anilist-manga-${raw.id}`,
        kind: 'manga',
        title,
        overview: raw.description?.replace(/<[^>]+>/g, ''),
        posterUrl: raw.coverImage?.extraLarge,
        backdropUrl: raw.bannerImage,
        releaseYear: raw.startDate?.year,
        rating: raw.averageScore ? raw.averageScore / 10 : undefined,
        genres: raw.genres,
        country: raw.countryOfOrigin,
        // Deep-link to a legal aggregated search (MangaPlus / VIZ / Crunchyroll all index by title).
        externalUrl: `https://mangaplus.shueisha.co.jp/search_result?word=${encodeURIComponent(title)}`,
    };
}
async function searchManga(query) {
    return (0, cache_1.withCache)(`anilist:search:${query.toLowerCase()}`, 60 * 30, async () => {
        const { data } = await axios_1.default.post(ANILIST_URL, { query: QUERY, variables: { search: query, page: 1, perPage: 20 } }, { timeout: 8000 });
        return data.data.Page.media.map(mapManga);
    });
}
async function trendingManga() {
    return (0, cache_1.withCache)('anilist:trending', 60 * 60, async () => {
        const { data } = await axios_1.default.post(ANILIST_URL, { query: QUERY, variables: { page: 1, perPage: 20, sort: ['TRENDING_DESC'] } }, { timeout: 8000 });
        return data.data.Page.media.map(mapManga);
    });
}
