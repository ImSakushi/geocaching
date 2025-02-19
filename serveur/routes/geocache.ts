// serveur/routes/geocache.ts
import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Geocache from '../models/Geocache';
import auth from '../middleware/auth';
import { asyncHandler } from '../middleware/asynchandler';

const router = Router();

/**
 * Helper : calcul de la distance en km entre deux points (formule haversine)
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Créer une nouvelle géocache (on accepte en plus un champ "password")
router.post(
  '/',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { gpsCoordinates, difficulty, description, password } = req.body;
    const newCache = new Geocache({
      gpsCoordinates,
      difficulty,
      description,
      password: password || '', // enregistre le mdp s’il est fourni, sinon chaîne vide
      creator: req.user.id,
      likes: [],
      comments: []
    });
    const cache = await newCache.save();
    res.json(cache);
  })
);

// Récupérer les géocaches (filtrage par proximité si lat, lng et radius sont fournis)
router.get(
  '/',
  auth,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lng, radius } = req.query;
    let caches;
    if (lat && lng && radius) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const rad = parseFloat(radius as string); // en km
      const allCaches = await Geocache.find()
        .populate('creator', 'email _id')
        .populate('comments.user', 'email avatar')
        .populate('foundBy', '_id');
      caches = allCaches.filter((cache: any) => {
        const { lat: cacheLat, lng: cacheLng } = cache.gpsCoordinates;
        const distance = getDistanceFromLatLonInKm(latitude, longitude, cacheLat, cacheLng);
        return distance <= rad;
      });
    } else {
      caches = await Geocache.find()
        .populate('creator', 'email _id')
        .populate('comments.user', 'email avatar')
        .populate('foundBy', '_id');
    }
    res.json(caches);
  })
);

// Route pour marquer une géocache comme trouvée
// Si la géocache possède un mot de passe, on vérifie qu’il correspond
router.post(
  '/:id/found',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      return res.status(404).json({ msg: 'Géocache non trouvée' });
    }
    // Si la géocache est protégée par un mot de passe, vérifier le mot de passe fourni
    if (cache.password && cache.password !== req.body.password) {
      return res.status(401).json({ msg: 'Mot de passe incorrect' });
    }
    // On ajoute l'ID de l'utilisateur s'il n'est pas déjà présent
    if (!cache.foundBy.map((id: any) => id.toString()).includes(userId)) {
      cache.foundBy.push(new mongoose.Types.ObjectId(userId));
      await cache.save();
    }
    res.json({ msg: 'Géocache marquée comme trouvée', found: true });
  })
);

// Modifier une géocache (uniquement par le créateur)
router.put(
  '/:id',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { gpsCoordinates, difficulty, description } = req.body;
    const cacheFields = { gpsCoordinates, difficulty, description };
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      res.status(404).json({ msg: 'Géocache non trouvée' });
      return;
    }
    if (cache.creator.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(401).json({ msg: 'Non autorisé' });
      return;
    }
    const updatedCache = await Geocache.findByIdAndUpdate(req.params.id, { $set: cacheFields }, { new: true });
    res.json(updatedCache);
  })
);

// Supprimer une géocache (uniquement par le créateur)
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      res.status(404).json({ msg: 'Géocache non trouvée' });
      return;
    }
    if (cache.creator.toString() !== req.user.id && !req.user.isAdmin) {
      res.status(401).json({ msg: 'Non autorisé' });
      return;
    }
    await Geocache.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Géocache supprimée' });
  })
);

// Ajouter un commentaire à une géocache
router.post(
  '/:id/comment',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const { text } = req.body;
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      res.status(404).json({ msg: 'Géocache non trouvée' });
      return;
    }
    const comment = {
      user: req.user.id,
      text,
      date: new Date(),
      likes: []
    };
    cache.comments.push(comment as any);
    const updatedCache = await cache.save();
    res.json(updatedCache);
  })
);

// Liker/déliker une géocache
router.post(
  '/:id/like',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res, next) => {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      return res.status(404).json({ msg: 'Géocache non trouvée' });
    }
    if (!cache.likes) {
      cache.likes = [];
    }
    const index = cache.likes.findIndex((id: any) => id.toString() === userObjectId.toString());
    if (index === -1) {
      cache.likes.push(userObjectId);
    } else {
      cache.likes.splice(index, 1);
    }
    await cache.save();
    res.json({ likesCount: cache.likes.length });
  })
);

// Liker/déliker un commentaire
router.post(
  '/:id/comment/:commentId/like',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res, next) => {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      return res.status(404).json({ msg: 'Géocache non trouvée' });
    }
    const comment = cache.comments.find((c: any) => c._id.toString() === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Commentaire non trouvé' });
    }
    if (comment.likes.some((id: any) => id.toString() === userObjectId.toString())) {
      comment.likes = comment.likes.filter((id: any) => id.toString() !== userObjectId.toString());
    } else {
      comment.likes.push(userObjectId);
    }
    await cache.save();
    res.json({ likesCount: comment.likes.length });
  })
);

// Modifier un commentaire (seul admin ou l'auteur peut le faire)
router.put(
  '/:id/comment/:commentId',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res: Response) => {
    const { text } = req.body;
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      return res.status(404).json({ msg: 'Géocache non trouvée' });
    }
    const comment = cache.comments.find(c => c._id.toString() === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Commentaire non trouvé' });
    }
    if (comment.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }
    comment.text = text;
    comment.date = new Date();
    await cache.save();
    res.json({ msg: 'Commentaire mis à jour', comment });
  })
);

// Supprimer un commentaire (seul admin ou l'auteur peut le faire)
router.delete(
  '/:id/comment/:commentId',
  auth,
  asyncHandler(async (req: Request & { user?: any }, res: Response) => {
    const cache = await Geocache.findById(req.params.id);
    if (!cache) {
      return res.status(404).json({ msg: 'Géocache non trouvée' });
    }
    const comment = cache.comments.find(c => c._id.toString() === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Commentaire non trouvé' });
    }
    if (comment.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }
    comment.remove();
    await cache.save();
    res.json({ msg: 'Commentaire supprimé' });
  })
);

export default router;