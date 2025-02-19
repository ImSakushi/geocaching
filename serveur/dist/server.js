"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
dotenv_1.default.config();
// Charger le document Swagger depuis le fichier
const swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync('./doc/swagger.yaml', 'utf8'));
// Se connecter à la DB seulement si on n'est pas en mode test
if (process.env.NODE_ENV !== 'test') {
    (0, db_1.default)();
}
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Documentation Swagger sur /api-docs
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Importation des routes
const auth_1 = __importDefault(require("./routes/auth"));
const geocache_1 = __importDefault(require("./routes/geocache"));
app.use('/api/auth', auth_1.default);
app.use('/api/geocache', geocache_1.default);
// Démarrage du serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}
// Exporter l'application pour les tests
exports.default = app;
