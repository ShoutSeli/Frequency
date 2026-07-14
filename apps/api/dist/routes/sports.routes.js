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
exports.sportsRouter = void 0;
const express_1 = require("express");
const sports = __importStar(require("../services/sports.service"));
const error_handler_1 = require("../middleware/error-handler");
exports.sportsRouter = (0, express_1.Router)();
exports.sportsRouter.get('/events', async (req, res, next) => {
    try {
        const date = String(req.query.date ?? new Date().toISOString().slice(0, 10));
        const events = await sports.getEventsByDate(date);
        res.json({ events });
    }
    catch (err) {
        next(err);
    }
});
exports.sportsRouter.get('/league/:name', async (req, res, next) => {
    try {
        const events = await sports.searchLeague(req.params.name);
        res.json({ events });
    }
    catch (err) {
        next(err);
    }
});
exports.sportsRouter.get('/team/search', async (req, res, next) => {
    try {
        const name = String(req.query.name ?? '');
        if (!name)
            throw new error_handler_1.ApiError(400, 'Query parameter "name" is required.');
        const teams = await sports.searchTeam(name);
        res.json({ teams });
    }
    catch (err) {
        next(err);
    }
});
exports.sportsRouter.get('/team/:id/history', async (req, res, next) => {
    try {
        const events = await sports.getTeamHistory(req.params.id);
        res.json({ events });
    }
    catch (err) {
        next(err);
    }
});
