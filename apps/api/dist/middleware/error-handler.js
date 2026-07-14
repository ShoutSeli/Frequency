"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.ApiError = ApiError;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, _req, res, _next) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message });
    }
    console.error('[unhandled error]', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
function notFoundHandler(_req, res) {
    res.status(404).json({ message: 'Route not found.' });
}
