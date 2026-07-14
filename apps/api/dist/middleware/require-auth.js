"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const auth_tokens_1 = require("../lib/auth-tokens");
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
        return res.status(401).json({ message: 'Missing authorization token.' });
    }
    try {
        const payload = (0, auth_tokens_1.verifyToken)(token);
        req.userId = payload.userId;
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}
/** Attaches userId if a valid token is present, but does not reject the request otherwise. */
function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (token) {
        try {
            req.userId = (0, auth_tokens_1.verifyToken)(token).userId;
        }
        catch {
            /* ignore invalid token for optional auth */
        }
    }
    next();
}
