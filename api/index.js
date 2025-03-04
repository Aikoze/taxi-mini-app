// api/index.js
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname avec ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
dotenv.config();

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

// Initialisation d'Express
const app = express();

// Middleware pour les requêtes CORS
const allowedOrigins = [
  'http://localhost:5173',                     // Développement local
  'https://taxi-mini-app.vercel.app',          // Application déployée
  'https://web.telegram.org',                  // Telegram Web Client
  'https://tg.dev',                            // Environnement de test Telegram
];

const corsOptions = {
  origin: function (origin, callback) {
    // En développement local, origin peut être null si la requête vient du même origine
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Vérifier si l'origine est dans les origines autorisées ou commence par une des origines autorisées
    const allowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || origin.startsWith(`${allowedOrigin}/`)
    );
    
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`Origine non autorisée: ${origin}`);
      callback(null, true); // En phase de développement, autoriser toutes les origines mais les logger
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

// Fonction pour charger dynamiquement un handler d'API Vercel
async function loadApiHandler(routePath) {
  try {
    // Construire le chemin du fichier
    const filePath = path.join(__dirname, routePath);
    if (fs.existsSync(filePath)) {
      const module = await import(filePath);
      return module.default;
    }
    return null;
  } catch (error) {
    console.error(`Erreur lors du chargement du handler pour ${routePath}:`, error);
    return null;
  }
}

// Configuration des routes Express
async function setupExpressRoutes() {
  // Route de base de l'API
  app.get('/api', async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API Taxi Mini App',
      version: '1.0.0',
      endpoints: [
        '/api/rides/available',
        '/api/rides',
        '/api/rides/:rideId/interest',
        '/api/auth/validate',
        '/api/debug'
      ]
    });
  });

  // Implémentation des routes principales (celles déjà configurées dans vos fonctions Vercel)
  const routeMappings = [
    // Format: [express_path, vercel_handler_path, param_mappings]
    ['/api/auth/validate', './auth/validate.js'],
    ['/api/users', './users/index.js'],
    ['/api/users/:userId/rides', './users/[userId]/rides.js', { userId: 'userId' }],
    ['/api/rides', './rides/index.js'],
    ['/api/rides/available', './rides/available.js'],
    ['/api/rides/:id', './rides/[id]/index.js', { id: 'id' }],
    ['/api/rides/:rideId/interest', './interest/ride/[rideId].js', { rideId: 'rideId' }],
    ['/api/debug', './debug.js'],
  ];

  // Configurer chaque route
  for (const [expressPath, handlerPath, paramMappings] of routeMappings) {
    const handler = await loadApiHandler(handlerPath);
    if (handler) {
      app.all(expressPath, async (req, res) => {
        // Mapper les paramètres Express aux paramètres de requête Vercel
        if (paramMappings) {
          for (const [expressParam, vercelParam] of Object.entries(paramMappings)) {
            if (req.params[expressParam]) {
              req.query[vercelParam] = req.params[expressParam];
            }
          }
        }
        
        // Appeler le handler Vercel
        try {
          await handler(req, res);
        } catch (error) {
          console.error(`Erreur dans le handler ${expressPath}:`, error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: 'Erreur interne du serveur',
              message: error.message
            });
          }
        }
      });
      console.log(`Route configurée: ${expressPath} -> ${handlerPath}`);
    } else {
      console.warn(`Impossible de charger le handler pour ${expressPath}`);
    }
  }
}

// Si exécuté directement (en mode serveur local)
if (process.env.USE_VERCEL_API === 'true' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  
  // Configurer les routes Express
  setupExpressRoutes().then(() => {
    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`Serveur API démarré sur le port ${PORT}`);
      console.log(`Pour accéder à l'API: http://localhost:${PORT}/api`);
    });
  });
}

// Format Vercel serverless function
export default async function handler(req, res) {
  // Utiliser la fonction setCorsHeaders pour une configuration cohérente
  try {
    const { setCorsHeaders } = await import('./_utils.js');
    setCorsHeaders(res);
  } catch (error) {
    // Fallback si l'import échoue
    console.error('Erreur lors de l\'import de setCorsHeaders:', error);
    
    // Détecter l'origine depuis l'en-tête de la requête
    const requestOrigin = req.headers?.origin || req.headers?.referer;
    let origin = 'http://localhost:5173';
    
    if (requestOrigin && process.env.VERCEL) {
      origin = requestOrigin;
    }
    
    // Appliquer manuellement les en-têtes CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  }

  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Renvoyer la liste des endpoints disponibles
  if (req.method === 'GET' && (req.url === '/api' || req.url === '/api/')) {
    return res.status(200).json({
      success: true,
      message: 'API Taxi Mini App',
      version: '1.0.0',
      endpoints: [
        '/api/rides/available',
        '/api/rides',
        '/api/rides/:rideId/interest',
        '/api/auth/validate',
        '/api/debug'
      ]
    });
  }

  // Analyser l'URL de la requête pour déterminer quel handler utiliser
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // Déterminer si la requête correspond à un chemin spécifique
    // Note: Les règles ici doivent correspondre aux routeMappings dans setupExpressRoutes
    
    // Routes d'authentification
    if (pathname === '/api/auth/validate') {
      const handler = await loadApiHandler('./auth/validate.js');
      if (handler) return handler(req, res);
    }
    
    // Routes utilisateurs
    else if (pathname === '/api/users') {
      const handler = await loadApiHandler('./users/index.js');
      if (handler) return handler(req, res);
    }
    else if (pathname.startsWith('/api/users/') && pathname.endsWith('/rides')) {
      // Extraire l'ID de l'utilisateur
      const userId = pathname.split('/')[3]; // /api/users/[userId]/rides
      req.query.userId = userId;
      const handler = await loadApiHandler('./users/[userId]/rides.js');
      if (handler) return handler(req, res);
    }
    
    // Routes des courses
    else if (pathname === '/api/rides/available') {
      const handler = await loadApiHandler('./rides/available.js');
      if (handler) return handler(req, res);
    }
    else if (pathname === '/api/rides') {
      const handler = await loadApiHandler('./rides/index.js');
      if (handler) return handler(req, res);
    }
    else if (pathname.startsWith('/api/rides/') && pathname.includes('/interest')) {
      // Extraire l'ID de la course
      const rideId = pathname.split('/')[3]; // /api/rides/[rideId]/interest
      req.query.rideId = rideId;
      const handler = await loadApiHandler('./interest/ride/[rideId].js');
      if (handler) return handler(req, res);
    }
    else if (pathname.startsWith('/api/rides/')) {
      // Extraire l'ID de la course
      const rideId = pathname.split('/')[3]; // /api/rides/[id]
      req.query.id = rideId;
      const handler = await loadApiHandler('./rides/[id]/index.js');
      if (handler) return handler(req, res);
    }
    
    // Route de débogage
    else if (pathname === '/api/debug') {
      const handler = await loadApiHandler('./debug.js');
      if (handler) return handler(req, res);
    }
    
    // Si aucune route ne correspond
    return res.status(404).json({ 
      success: false, 
      error: 'Not Found',
      message: `Route non trouvée: ${pathname}`
    });
    
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
