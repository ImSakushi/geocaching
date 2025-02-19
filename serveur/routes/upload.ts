// serveur/routes/upload.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import auth from '../middleware/auth';
import { asyncHandler } from '../middleware/asynchandler';
import User from '../models/User';
import Geocache from '../models/Geocache';
import path from 'path';
import fs from 'fs';

const router = Router();

// Détermine le chemin absolu du dossier uploads (ici, on le place à la racine du projet)
const uploadDir = path.join(__dirname, '../../uploads');

// Vérifie si le dossier existe, sinon le crée
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer pour enregistrer les fichiers dans le dossier uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + Date.now() + ext;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Mettre à jour l'avatar d'un utilisateur
router.put('/avatar', auth, upload.single('avatar'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ msg: "Aucun fichier envoyé" });
  }
  const userId = (req as any).user.id;
  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
  res.json({ msg: "Avatar mis à jour", avatar: user?.avatar });
}));

// Ajouter une photo à une géocache
router.post('/geocache/:id/photo', auth, upload.single('photo'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ msg: "Aucun fichier envoyé" });
  }
  const geocacheId = req.params.id;
  const photoUrl = `/uploads/${req.file.filename}`;
  const geocache = await Geocache.findById(geocacheId);
  if (!geocache) {
    return res.status(404).json({ msg: "Géocache non trouvée" });
  }
  geocache.photos.push(photoUrl);
  await geocache.save();
  res.json({ msg: "Photo ajoutée", photos: geocache.photos });
}));

export default router;