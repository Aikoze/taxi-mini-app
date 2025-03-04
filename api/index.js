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

// Utiliser les variables backend ou frontend comme fallback
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT;

console.log('Variables d\'environnement dans API:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'défini' : 'non défini');
console.log('SUPABASE_KEY:', SUPABASE_KEY ? 'défini' : 'non défini');
console.log('TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'défini' : 'non défini');

// Initialisation de Supabase
let supabase = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Supabase:', error.message);
}

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
