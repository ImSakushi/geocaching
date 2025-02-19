// serveur/routes/rankings.ts
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asynchandler';
import auth from '../middleware/auth';
import Geocache from '../models/Geocache';
import User from '../models/User';

const router = Router();

// Classement : Meilleurs clients (ceux qui ont trouvé le plus de caches)
router.get('/best-customers', auth, asyncHandler(async (req: Request, res: Response) => {
  const results = await Geocache.aggregate([
    { $unwind: "$foundBy" },
    { $group: { _id: "$foundBy", finds: { $sum: 1 } } },
    { $sort: { finds: -1 } },
    { $limit: 10 }
  ]);
  // Récupérer les infos utilisateur
  const users = await User.find({ _id: { $in: results.map(r => r._id) } }, { password: 0 });
  const rankings = results.map(result => {
    const user = users.find(u => u._id.toString() === result._id.toString());
    return {
      user: user ? { _id: user._id, email: user.email, avatar: user.avatar } : null,
      finds: result.finds
    };
  });
  res.json(rankings);
}));

// Classement : Caches les plus populaires (par nombre de likes)
router.get('/popular-caches', auth, asyncHandler(async (req: Request, res: Response) => {
    const caches = await Geocache.aggregate([
      { 
        $addFields: { 
          likesCount: { 
            $size: { 
              $cond: { if: { $isArray: "$likes" }, then: "$likes", else: [] } 
            } 
          } 
        } 
      },
      { $sort: { likesCount: -1 } },
      { $limit: 10 }
    ]);
    res.json(caches);
  }));

// Classement : Caches les moins trouvées (par nombre de fois trouvées)
router.get('/rarely-found-caches', auth, asyncHandler(async (req: Request, res: Response) => {
    const caches = await Geocache.aggregate([
      { 
        $addFields: { 
          foundCount: { 
            $size: { 
              $cond: { if: { $isArray: "$foundBy" }, then: "$foundBy", else: [] } 
            } 
          } 
        } 
      },
      { $sort: { foundCount: 1 } },
      { $limit: 10 }
    ]);
    res.json(caches);
  }));

export default router;