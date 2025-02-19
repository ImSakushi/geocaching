"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../config/auth");
const auth = (req, res, next) => {
    // Le token doit être dans le header Authorization sous la forme "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Pas de token, accès refusé' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, auth_1.JWT_SECRET);
        req.user = decoded.user; // Assurez-vous que le payload est bien formé
        next();
    }
    catch (err) {
        res.status(401).json({ msg: 'Token invalide' });
    }
};
exports.default = auth;
