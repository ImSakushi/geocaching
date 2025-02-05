
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/geocaching_test';

let tokenUser1: string;
let tokenUser2: string;
let geocacheId: string;

beforeAll(async () => {
  
  await mongoose.connect(MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as mongoose.ConnectOptions);

  
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'user1@example.com', password: 'password1' });
  const res1 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user1@example.com', password: 'password1' });
  tokenUser1 = res1.body.token;

  
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'user2@example.com', password: 'password2' });
  const res2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user2@example.com', password: 'password2' });
  tokenUser2 = res2.body.token;
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('Endpoints des géocaches', () => {
  test("User1 peut créer une géocache", async () => {
    const geocacheData = {
      gpsCoordinates: { lat: 48.8566, lng: 2.3522 },
      difficulty: 3,
      description: 'Test geocache de user1'
    };

    const res = await request(app)
      .post('/api/geocache')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send(geocacheData);
      
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeDefined();
    expect(res.body.creator).toBeDefined();
    
    geocacheId = res.body._id;
  });

  test("User1 peut modifier sa géocache", async () => {
    const updatedData = {
      gpsCoordinates: { lat: 48.8570, lng: 2.3520 },
      difficulty: 4,
      description: 'Description mise à jour'
    };

    const res = await request(app)
      .put(`/api/geocache/${geocacheId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe(updatedData.description);
    expect(res.body.difficulty).toBe(updatedData.difficulty);
  });

  test("User2 ne peut PAS modifier la géocache de user1", async () => {
    const updatedData = {
      gpsCoordinates: { lat: 48.8575, lng: 2.3525 },
      difficulty: 5,
      description: 'Tentative de modification par user2'
    };

    const res = await request(app)
      .put(`/api/geocache/${geocacheId}`)
      .set('Authorization', `Bearer ${tokenUser2}`)
      .send(updatedData);

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Non autorisé');
  });

  test("User1 peut supprimer sa géocache", async () => {
    const res = await request(app)
      .delete(`/api/geocache/${geocacheId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Géocache supprimée');
  });

  test("User2 ne peut PAS supprimer une géocache qui ne lui appartient pas", async () => {
    
    const geocacheData = {
      gpsCoordinates: { lat: 48.8566, lng: 2.3522 },
      difficulty: 2,
      description: 'Autre geocache de user1'
    };

    const createRes = await request(app)
      .post('/api/geocache')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send(geocacheData);
    const newGeocacheId = createRes.body._id;

    const res = await request(app)
      .delete(`/api/geocache/${newGeocacheId}`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Non autorisé');
  });

  test("Modification d'une géocache inexistante renvoie 404", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/geocache/${fakeId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        gpsCoordinates: { lat: 48.857, lng: 2.352 },
        difficulty: 3,
        description: 'Modif inexistante'
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.msg).toBe('Géocache non trouvée');
  });

  test("Suppression d'une géocache inexistante renvoie 404", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/geocache/${fakeId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.msg).toBe('Géocache non trouvée');
  });
});