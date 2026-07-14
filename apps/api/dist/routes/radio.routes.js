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
exports.radioRouter = void 0;
const express_1 = require("express");
const radio = __importStar(require("../services/radio.service"));
const error_handler_1 = require("../middleware/error-handler");
exports.radioRouter = (0, express_1.Router)();
exports.radioRouter.get('/search', async (req, res, next) => {
    try {
        const q = String(req.query.q ?? '');
        if (!q)
            throw new error_handler_1.ApiError(400, 'Query parameter "q" is required.');
        const stations = await radio.searchStations(q);
        res.json({ stations });
    }
    catch (err) {
        next(err);
    }
});
exports.radioRouter.get('/country/:country', async (req, res, next) => {
    try {
        const stations = await radio.stationsByCountry(req.params.country);
        res.json({ stations });
    }
    catch (err) {
        next(err);
    }
});
exports.radioRouter.get('/top', async (_req, res, next) => {
    try {
        const stations = await radio.topStations();
        res.json({ stations });
    }
    catch (err) {
        next(err);
    }
});
exports.radioRouter.get('/tag/:tag', async (req, res, next) => {
    try {
        const stations = await radio.stationsByTag(req.params.tag);
        res.json({ stations });
    }
    catch (err) {
        next(err);
    }
});
