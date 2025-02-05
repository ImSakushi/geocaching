// routes/auth.ts
import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../middleware/asynchandler';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth';

const router = Router();

// Route d'inscription
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ msg: 'Utilisateur déjà existant' });
      return;
    }
    
    const user = new User({ email, password });
    await user.save();
    
    // Génère le token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.json({ token });
  })
);

// Route de connexion
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    
    // Vérifie que l'utilisateur existe
    const user = await User.findOne({ email });
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
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.json({ token });
  })
);

export default router;