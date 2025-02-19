"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tests/auth.test.ts
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../server"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/geocaching_test';
beforeAll(async () => {
    await mongoose_1.default.connect(MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});
afterAll(async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        await mongoose_1.default.connection.db.dropDatabase();
        await mongoose_1.default.disconnect();
    }
});
describe("Routes d'authentification", () => {
    const userData = {
        email: 'test@example.com',
        password: 'password123'
    };
    test("Inscription d'un nouvel utilisateur", async () => {
        const res = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/register')
            .send(userData);
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });
    test("Connexion d'un utilisateur existant", async () => {
        // On s'assure que l'utilisateur existe déjà
        const user = await User_1.default.findOne({ email: userData.email });
        expect(user).toBeDefined();
        const res = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/login')
            .send(userData);
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });
    test("Erreur lors de la connexion avec de mauvais identifiants", async () => {
        const res = await (0, supertest_1.default)(server_1.default)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'mauvaisMotDePasse' });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe('Identifiants invalides');
    });
});
