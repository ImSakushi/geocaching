// seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import User from './models/User';
import Geocache from './models/Geocache';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Geocache.deleteMany();

    const user1 = new User({ email: 'matthias.casanova@mmibordeaux.com', password: 'password1' });
    const user2 = new User({ email: 'hugo.gitton@mmibordeaux.com', password: 'password2' });
    const user3 = new User({ email: 'nino.lefort@mmibordeaux.com', password: 'password3' });
    await user1.save();
    await user2.save();
    await user3.save();

    interface CacheSeed {
      city: string;
      gpsCoordinates: { lat: number; lng: number };
      difficulty: number;
      description: string;
      creator: mongoose.Types.ObjectId;
      password?: string; // Nouveau champ optionnel pour le mot de passe
    }

    const caches: CacheSeed[] = [
      {
        city: 'Paris',
        gpsCoordinates: { lat: 48.8566, lng: 2.3522 },
        difficulty: 3,
        description: 'Cache dans le centre de Paris',
        creator: user1._id,
        password: 'secret123' // Protégée par un mot de passe
      },
      {
        city: 'Toulouse',
        gpsCoordinates: { lat: 43.6047, lng: 1.4442 },
        difficulty: 2,
        description: 'Cache à Toulouse',
        creator: user2._id,
        password: '' // Pas de mot de passe
      },
      {
        city: 'Lyon',
        gpsCoordinates: { lat: 45.7640, lng: 4.8357 },
        difficulty: 4,
        description: 'Cache près du vieux Lyon',
        creator: user1._id,
        password: 'passLyon'
      },
      {
        city: 'Marseille',
        gpsCoordinates: { lat: 43.2965, lng: 5.3698 },
        difficulty: 3,
        description: 'Cache dans le Vieux-Port de Marseille',
        creator: user3._id,
        password: ''
      },
      {
        city: 'Nice',
        gpsCoordinates: { lat: 43.7102, lng: 7.2620 },
        difficulty: 2,
        description: 'Cache sur la Promenade des Anglais',
        creator: user2._id,
        password: 'nice2025'
      },
      {
        city: 'Bordeaux',
        gpsCoordinates: { lat: 44.8378, lng: -0.5792 },
        difficulty: 4,
        description: 'Cache au cœur de Bordeaux',
        creator: user1._id,
        password: ''
      },
      {
        city: 'Nantes',
        gpsCoordinates: { lat: 47.2184, lng: -1.5536 },
        difficulty: 3,
        description: 'Cache dans les rues de Nantes',
        creator: user3._id,
        password: 'nantes!'
      },
      {
        city: 'Strasbourg',
        gpsCoordinates: { lat: 48.5734, lng: 7.7521 },
        difficulty: 4,
        description: 'Cache près de la cathédrale de Strasbourg',
        creator: user2._id,
        password: ''
      },
      {
        city: 'Montpellier',
        gpsCoordinates: { lat: 43.6108, lng: 3.8767 },
        difficulty: 2,
        description: 'Cache dans Montpellier centre-ville',
        creator: user1._id,
        password: ''
      },
      {
        city: 'Rennes',
        gpsCoordinates: { lat: 48.1173, lng: -1.6778 },
        difficulty: 3,
        description: 'Cache dans le centre historique de Rennes',
        creator: user3._id,
        password: 'rennes123'
      },
      {
        city: 'Reims',
        gpsCoordinates: { lat: 49.2583, lng: 4.0317 },
        difficulty: 2,
        description: 'Cache dans Reims, ville du champagne',
        creator: user2._id,
        password: ''
      },
      {
        city: 'Le Havre',
        gpsCoordinates: { lat: 49.4944, lng: 0.1079 },
        difficulty: 3,
        description: 'Cache avec vue sur la mer à Le Havre',
        creator: user1._id,
        password: 'havre2025'
      },
      {
        city: 'Saint-Étienne',
        gpsCoordinates: { lat: 45.4397, lng: 4.3872 },
        difficulty: 4,
        description: 'Cache dans la région industrielle de Saint-Étienne',
        creator: user3._id,
        password: ''
      },
      {
        city: 'Grenoble',
        gpsCoordinates: { lat: 45.1885, lng: 5.7245 },
        difficulty: 3,
        description: 'Cache au pied des montagnes à Grenoble',
        creator: user2._id,
        password: 'grenoble'
      },
      {
        city: 'Dijon',
        gpsCoordinates: { lat: 47.3220, lng: 5.0415 },
        difficulty: 2,
        description: 'Cache dans le centre historique de Dijon',
        creator: user1._id,
        password: ''
      },
      {
        city: 'Limoges',
        gpsCoordinates: { lat: 45.8336, lng: 1.2611 },
        difficulty: 3,
        description: 'Cache dans la région de la porcelaine à Limoges',
        creator: user3._id,
        password: 'limoges!'
      },
    ];

    // Insertion des géocaches
    for (const cacheData of caches) {
      const cache = new Geocache(cacheData);
      await cache.save();
    }

    console.log(`${caches.length} géocaches insérées avec succès`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();