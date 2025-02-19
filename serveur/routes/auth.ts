// serveur/routes/auth.ts
import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../middleware/asynchandler';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth';

const router = Router();

// route d'inscription
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    
    // check si user existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).json({ msg: 'Utilisateur déjà existant' });
      return;
    }
    
    const user = new User({ email, password });
    await user.save();
    
    // génère token
    const payload = { user: { id: user._id, isAdmin: user.isAdmin } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // retourne token, id & avatar
    res.status(201).json({ token, userId: user._id, avatar: user.avatar });
  })
);

// route de connexion
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ msg: 'Identifiants invalides' });
      return;
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ msg: 'Identifiants invalides' });
      return;
    }
    
    // ajoute isAdmin au payload
    const payload = { user: { id: user._id, isAdmin: user.isAdmin } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // retourne token, id & avatar
    res.status(201).json({ token, userId: user._id, avatar: user.avatar });
  })
);

export default router;