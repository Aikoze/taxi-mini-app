// api/index.js
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import telegramService from '../server/telegramService.js';
import rideAssignmentService from '../server/rideAssignmentService.js';
import autoAssignmentService from '../server/autoAssignmentService.js';
import statsServiceFactory from '../server/statsService.js';

// Configuration
dotenv.config({ path: './server/.env' });
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialisation de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialisation des services
const statsService = statsServiceFactory(supabase);

// Initialisation d'Express
const app = express();

// Middleware pour les requêtes CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());
app.use(bodyParser.json());

// Importer toutes les routes depuis le fichier server/index.js
import serverApp from '../server/index.js';

// Utiliser toutes les routes définies dans le serveur
app.use('/', serverApp);

// Export pour Vercel
export default app;
