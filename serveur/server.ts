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

// charge doc swagger
const swaggerDocument = yaml.load(fs.readFileSync('./doc/swagger.yaml', 'utf8')) as Record<string, unknown>;

// connecte db (sauf en test)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());

// expose uploads pr servir images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// doc swagger sur /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// importe routes 
import authRoutes from './routes/auth';
import geocacheRoutes from './routes/geocache';
import adminRoutes from './routes/admin';
import rankingsRoutes from './routes/rankings';
import uploadRoutes from './routes/upload';

app.use('/api/auth', authRoutes);
app.use('/api/geocache', geocacheRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/upload', uploadRoutes);

// start serveur si fichier exécuté direct
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}

export default app;