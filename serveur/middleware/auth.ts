// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';

interface AuthRequest extends Request {
  user?: any;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Le token doit être dans le header "Bearer <token>"
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Pas de token, accès refusé' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded.user; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide' });
  }
};

export default auth;