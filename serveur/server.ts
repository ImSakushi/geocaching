// serveur/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';


dotenv.config();

// Charger la documentation Swagger
const swaggerDocument = yaml.load(fs.readFileSync('./doc/swagger.yaml', 'utf8')) as Record<string, unknown>;

// Connexion à la DB (sauf en mode test)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Exposer le dossier uploads pour servir les images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Documentation Swagger sur /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Importation des routes existantes
import authRoutes from './routes/auth';
import geocacheRoutes from './routes/geocache';
import adminRoutes from './routes/admin';
// Importation des nouvelles routes
import rankingsRoutes from './routes/rankings';
import uploadRoutes from './routes/upload';

app.use('/api/auth', authRoutes);
app.use('/api/geocache', geocacheRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/upload', uploadRoutes);

// Démarrage du serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}

export default app;