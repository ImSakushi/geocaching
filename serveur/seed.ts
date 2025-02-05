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

    // Supprimer les anciennes données
    await User.deleteMany();
    await Geocache.deleteMany();

    // Créer quelques utilisateurs
    const user1 = new User({ email: 'alice@example.com', password: 'password1' });
    const user2 = new User({ email: 'bob@example.com', password: 'password2' });
    await user1.save();
    await user2.save();

    // Créer quelques geocaches
    const cache1 = new Geocache({
      gpsCoordinates: { lat: 48.8566, lng: 2.3522 },
      difficulty: 3,
      description: 'Cache dans le centre de Paris',
      creator: user1._id
    });

    const cache2 = new Geocache({
      gpsCoordinates: { lat: 43.6047, lng: 1.4442 },
      difficulty: 2,
      description: 'Cache à Toulouse',
      creator: user2._id
    });

    await cache1.save();
    await cache2.save();

    console.log('Données de seed insérées avec succès');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();