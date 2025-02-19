"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../server"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/geocaching_test';
let tokenUser1;
let tokenUser2;
let geocacheId;
beforeAll(async () => {
    await mongoose_1.default.connect(MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/register')
        .send({ email: 'user1@example.com', password: 'password1' });
    const res1 = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ email: 'user1@example.com', password: 'password1' });
    tokenUser1 = res1.body.token;
    await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/register')
        .send({ email: 'user2@example.com', password: 'password2' });
    const res2 = await (0, supertest_1.default)(server_1.default)
        .post('/api/auth/login')
        .send({ email: 'user2@example.com', password: 'password2' });
    tokenUser2 = res2.body.token;
});
afterAll(async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        await mongoose_1.default.connection.db.dropDatabase();
        await mongoose_1.default.disconnect();
    }
});
describe('Endpoints des géocaches', () => {
    test("User1 peut créer une géocache", async () => {
        const geocacheData = {
            gpsCoordinates: { lat: 48.8566, lng: 2.3522 },
            difficulty: 3,
            description: 'Test geocache de user1'
        };
        const res = await (0, supertest_1.default)(server_1.default)
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
        const res = await (0, supertest_1.default)(server_1.default)
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
        const res = await (0, supertest_1.default)(server_1.default)
            .put(`/api/geocache/${geocacheId}`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send(updatedData);
        expect(res.statusCode).toBe(401);
        expect(res.body.msg).toBe('Non autorisé');
    });
    test("User1 peut supprimer sa géocache", async () => {
        const res = await (0, supertest_1.default)(server_1.default)
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
        const createRes = await (0, supertest_1.default)(server_1.default)
            .post('/api/geocache')
            .set('Authorization', `Bearer ${tokenUser1}`)
            .send(geocacheData);
        const newGeocacheId = createRes.body._id;
        const res = await (0, supertest_1.default)(server_1.default)
            .delete(`/api/geocache/${newGeocacheId}`)
            .set('Authorization', `Bearer ${tokenUser2}`);
        expect(res.statusCode).toBe(401);
        expect(res.body.msg).toBe('Non autorisé');
    });
    test("Modification d'une géocache inexistante renvoie 404", async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const res = await (0, supertest_1.default)(server_1.default)
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
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const res = await (0, supertest_1.default)(server_1.default)
            .delete(`/api/geocache/${fakeId}`)
            .set('Authorization', `Bearer ${tokenUser1}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe('Géocache non trouvée');
    });
});
