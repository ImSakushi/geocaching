"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_EXPIRES_IN = exports.JWT_SECRET = void 0;
// config/auth.ts
exports.JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
