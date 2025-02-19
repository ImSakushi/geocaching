// serveur/routes/admin.ts
import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../middleware/asynchandler';
import auth from '../middleware/auth';

const router = Router();

// check si user est admin
const adminAuth = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ msg: "Accès refusé : administrateur uniquement" });
    }
    next();
  };

// toutes les routes ici req auth + admin
router.use(auth, adminAuth);

// récupère liste users (sans mdp)
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}, { password: 0 });
  res.json(users);
}));

// update mdp user
router.put('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ msg: "Nouveau mot de passe requis" });
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: "Utilisateur non trouvé" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();
  res.json({ msg: "Mot de passe mis à jour avec succès" });
}));

// supprime un user
router.delete('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: "Utilisateur non trouvé" });
  }
  res.json({ msg: "Utilisateur supprimé avec succès" });
}));

// Dans serveur/routes/admin.ts
router.put('/users/:id/admin', asyncHandler(async (req, res) => {
    const { isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé" });
    }
    user.isAdmin = isAdmin;
    await user.save();
    res.json({ msg: "Statut admin mis à jour" });
  }));

export default router;