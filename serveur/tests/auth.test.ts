// tests/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/geocaching_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as mongoose.ConnectOptions);
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
});

describe("Routes d'authentification", () => {
  const userData = {
    email: 'test@example.com',
    password: 'password123'
  };

  test("Inscription d'un nouvel utilisateur", async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
      
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test("Connexion d'un utilisateur existant", async () => {
    // check si user existe déjà
    const user = await User.findOne({ email: userData.email });
    expect(user).toBeDefined();
    
    const res = await request(app)
      .post('/api/auth/login')
      .send(userData);
      
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test("Erreur lors de la connexion avec de mauvais identifiants", async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'mauvaisMotDePasse' });
      
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Identifiants invalides');
  });
});