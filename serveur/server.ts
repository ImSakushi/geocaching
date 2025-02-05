// server.ts
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './doc/swagger.json';

dotenv.config();

// Se connecter à la DB seulement si on n'est pas en mode test
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Documentation Swagger sur /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Importation des routes
import authRoutes from './routes/auth';
import geocacheRoutes from './routes/geocache';

app.use('/api/auth', authRoutes);
app.use('/api/geocache', geocacheRoutes);

// Démarrage du serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}

// Exporter l'application pour les tests
export default app;