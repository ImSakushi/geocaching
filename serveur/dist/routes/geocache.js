"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/geocache.ts
const express_1 = require("express");
const Geocache_1 = __importDefault(require("../models/Geocache"));
const auth_1 = __importDefault(require("../middleware/auth"));
const asynchandler_1 = require("../middleware/asynchandler");
const router = (0, express_1.Router)();
/**
 * Helper : calcul de la distance en km entre deux points (formule haversine)
 */
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // rayon de la Terre en km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// Créer une nouvelle géocache
router.post('/', auth_1.default, (0, asynchandler_1.asyncHandler)(async (req, res, next) => {
    const { gpsCoordinates, difficulty, description } = req.body;
    const newCache = new Geocache_1.default({
        gpsCoordinates,
        difficulty,
        description,
        creator: req.user.id
    });
    const cache = await newCache.save();
    res.json(cache);
}));
// Récupérer les géocaches (filtrage par proximité si lat, lng et radius sont fournis)
router.get('/', auth_1.default, (0, asynchandler_1.asyncHandler)(async (req, res, next) => {
    const { lat, lng, radius } = req.query;
    let caches;
    if (lat && lng && radius) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const rad = parseFloat(radius); // en km
        // Pour de grandes quantités de données, envisagez d'utiliser un index 2dsphere et les opérateurs MongoDB géospatiaux ($near, $geoWithin, etc.)
        const allCaches = await Geocache_1.default.find().populate('creator', 'email');
        caches = allCaches.filter((cache) => {
            const { lat: cacheLat, lng: cacheLng } = cache.gpsCoordinates;
            const distance = getDistanceFromLatLonInKm(latitude, longitude, cacheLat, cacheLng);
            return distance <= rad;
        });
    }
    else {
        caches = await Geocache_1.default.find().populate('creator', 'email');
    }
    res.json(caches);
}));
// Modifier une géocache (seulement si l'utilisateur en est le créateur)
router.put('/:id', auth_1.default, (0, asynchandler_1.asyncHandler)(async (req, res, next) => {
    const { gpsCoordinates, difficulty, description } = req.body;
    const cacheFields = { gpsCoordinates, difficulty, description };
    const cache = await Geocache_1.default.findById(req.params.id);
    if (!cache) {
        res.status(404).json({ msg: 'Géocache non trouvée' });
        return;
    }
    // Vérifie que l'utilisateur est bien le créateur
    if (cache.creator.toString() !== req.user.id) {
        res.status(401).json({ msg: 'Non autorisé' });
        return;
    }
    const updatedCache = await Geocache_1.default.findByIdAndUpdate(req.params.id, { $set: cacheFields }, { new: true });
    res.json(updatedCache);
}));
// Supprimer une géocache (seulement si l'utilisateur en est le créateur)
router.delete('/:id', auth_1.default, (0, asynchandler_1.asyncHandler)(async (req, res, next) => {
    const cache = await Geocache_1.default.findById(req.params.id);
    if (!cache) {
        res.status(404).json({ msg: 'Géocache non trouvée' });
        return;
    }
    if (cache.creator.toString() !== req.user.id) {
        res.status(401).json({ msg: 'Non autorisé' });
        return;
    }
    await Geocache_1.default.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Géocache supprimée' });
}));
// Ajouter un commentaire à une géocache
router.post('/:id/comment', auth_1.default, (0, asynchandler_1.asyncHandler)(async (req, res, next) => {
    const { text } = req.body;
    const cache = await Geocache_1.default.findById(req.params.id);
    if (!cache) {
        res.status(404).json({ msg: 'Géocache non trouvée' });
        return;
    }
    cache.comments.push({
        user: req.user.id,
        text,
        date: new Date()
    });
    const updatedCache = await cache.save();
    res.json(updatedCache);
}));
exports.default = router;
