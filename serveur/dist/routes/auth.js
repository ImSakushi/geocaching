"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/auth.ts
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const asynchandler_1 = require("../middleware/asynchandler");
const auth_1 = require("../config/auth");
const router = (0, express_1.Router)();
// Route d'inscription
router.post('/register', (0, asynchandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        res.status(400).json({ msg: 'Utilisateur déjà existant' });
        return;
    }
    const user = new User_1.default({ email, password });
    await user.save();
    // Génère le token
    const payload = { user: { id: user.id } };
    const token = jsonwebtoken_1.default.sign(payload, auth_1.JWT_SECRET, { expiresIn: auth_1.JWT_EXPIRES_IN });
    res.json({ token });
}));
// Route de connexion
router.post('/login', (0, asynchandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    // Vérifie que l'utilisateur existe
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(400).json({ msg: 'Identifiants invalides' });
        return;
    }
    // Vérifie le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        res.status(400).json({ msg: 'Identifiants invalides' });
        return;
    }
    // Génère le token
    const payload = { user: { id: user.id } };
    const token = jsonwebtoken_1.default.sign(payload, auth_1.JWT_SECRET, { expiresIn: auth_1.JWT_EXPIRES_IN });
    res.json({ token });
}));
exports.default = router;
