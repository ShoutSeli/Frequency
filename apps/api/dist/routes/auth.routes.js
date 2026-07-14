"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_tokens_1 = require("../lib/auth-tokens");
const require_auth_1 = require("../middleware/require-auth");
const error_handler_1 = require("../middleware/error-handler");
exports.authRouter = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters.'),
    displayName: zod_1.z.string().min(2).max(40),
});
function toProfile(user) {
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ?? undefined,
        plan: user.plan,
        createdAt: user.createdAt.toISOString(),
    };
}
exports.authRouter.post('/signup', async (req, res, next) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new error_handler_1.ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid input.');
        }
        const { email, password, displayName } = parsed.data;
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new error_handler_1.ApiError(409, 'An account with that email already exists.');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({ data: { email, passwordHash, displayName } });
        const token = (0, auth_tokens_1.signToken)({ userId: user.id });
        const response = { token, user: toProfile(user) };
        res.status(201).json(response);
    }
    catch (err) {
        next(err);
    }
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.authRouter.post('/login', async (req, res, next) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new error_handler_1.ApiError(400, 'Email and password are required.');
        }
        const { email, password } = parsed.data;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new error_handler_1.ApiError(401, 'Incorrect email or password.');
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid)
            throw new error_handler_1.ApiError(401, 'Incorrect email or password.');
        const token = (0, auth_tokens_1.signToken)({ userId: user.id });
        const response = { token, user: toProfile(user) };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.get('/me', require_auth_1.requireAuth, async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
        if (!user)
            throw new error_handler_1.ApiError(404, 'User not found.');
        res.json(toProfile(user));
    }
    catch (err) {
        next(err);
    }
});
