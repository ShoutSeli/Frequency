"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRouter = void 0;
const express_1 = require("express");
const tmdb = __importStar(require("../services/tmdb.service"));
const anilist = __importStar(require("../services/anilist.service"));
const error_handler_1 = require("../middleware/error-handler");
exports.mediaRouter = (0, express_1.Router)();
exports.mediaRouter.get('/search', async (req, res, next) => {
    try {
        const query = String(req.query.q ?? '').trim();
        if (!query)
            throw new error_handler_1.ApiError(400, 'Query parameter "q" is required.');
        const [screenResults, mangaResults] = await Promise.all([
            tmdb.searchMulti(query).catch(() => []),
            anilist.searchManga(query).catch(() => []),
        ]);
        res.json({ results: [...screenResults, ...mangaResults] });
    }
    catch (err) {
        next(err);
    }
});
exports.mediaRouter.get('/trending', async (_req, res, next) => {
    try {
        const results = await tmdb.trending();
        res.json({ results });
    }
    catch (err) {
        next(err);
    }
});
exports.mediaRouter.get('/discover/:kind', async (req, res, next) => {
    try {
        const kind = req.params.kind;
        if (kind === 'manga') {
            const results = await anilist.trendingManga();
            return res.json({ results });
        }
        if (!['movie', 'tv', 'anime', 'documentary', 'telenovela'].includes(kind)) {
            throw new error_handler_1.ApiError(400, 'Unsupported category.');
        }
        const results = await tmdb.discover(kind);
        res.json({ results });
    }
    catch (err) {
        next(err);
    }
});
exports.mediaRouter.get('/detail/:type/:id', async (req, res, next) => {
    try {
        const type = req.params.type;
        const id = Number(req.params.id);
        if (!['movie', 'tv'].includes(type) || Number.isNaN(id)) {
            throw new error_handler_1.ApiError(400, 'Invalid media reference.');
        }
        const detail = await tmdb.getDetail(id, type);
        res.json(detail);
    }
    catch (err) {
        next(err);
    }
});
