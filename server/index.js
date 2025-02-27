// server/index.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

// Configuration
dotenv.config();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialisation de Supabase (seulement si les variables d'environnement sont définies)
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  console.log('Initialisation de Supabase avec URL:', SUPABASE_URL);
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn('Variables d\'environnement Supabase manquantes, fonctionnalités Supabase désactivées');
}

// Initialisation d'Express
const app = express();

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware
// Configuration CORS plus permissive pour le développement
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://taxi-mini-app.loca.lt'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware pour les requêtes OPTIONS préliminaires CORS
app.options('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'https://taxi-mini-app.loca.lt'],
  credentials: true
}));

app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('API du Taxi Mini App est en ligne!');
});

// Route pour valider l'authentification Telegram
app.post('/api/auth/validate', async (req, res) => {
  try {
    const { telegramInitData } = req.body;
    
    // En mode développement, on peut simuler une validation réussie
    if (process.env.NODE_ENV === 'development' || telegramInitData === 'iframe-fallback-data') {
      return res.json({
        isRegistered: false,
        user: null,
        telegramUser: {
          id: Date.now(),
          first_name: "Utilisateur",
          last_name: "Test",
          username: `dev_user_${Date.now()}`,
          language_code: "fr",
          is_premium: false
        }
      });
    }
    
    // TODO: Implémenter la vérification réelle des données Telegram
    // Pour l'instant, on retourne simplement les données reçues
    
    // Vérifier si l'utilisateur est déjà enregistré
    // Pour l'exemple, on considère qu'il n'est pas enregistré
    return res.json({
      isRegistered: false,
      user: null,
      telegramUser: {
        id: Date.now(),
        first_name: "Utilisateur",
        last_name: "API",
        username: `api_user_${Date.now()}`,
        language_code: "fr",
        is_premium: false
      }
    });
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    res.status(500).json({ error: 'Erreur lors de la validation des données Telegram' });
  }
});

// Route pour enregistrer un nouvel utilisateur
app.post('/api/users', async (req, res) => {
  try {
    const { telegramUser, phone, email, address } = req.body;
    
    // Créer l'utilisateur dans la base de données
    const user = {
      id: telegramUser.id.toString(),
      telegram_id: telegramUser.id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username || '',
      phone_number: phone,
      email: email,
      address: address,
      created_at: new Date().toISOString()
    };
    
    // TODO: Enregistrer l'utilisateur dans Supabase
    // Pour l'instant, on retourne simplement l'utilisateur créé
    
    res.json({
      success: true,
      data: user,
      message: 'Utilisateur enregistré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de l\'enregistrement de l\'utilisateur',
      message: error.message
    });
  }
});

// Route pour récupérer les courses d'un utilisateur
app.get('/api/users/:userId/rides', (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;
  
  console.log(`Récupération des courses pour l'utilisateur ${userId}${status ? ` avec statut ${status}` : ''}`);
  
  // Données de test
  const rides = [
    {
      id: 1,
      user_id: userId,
      driver_id: null,
      pickup_location: "123 Rue de Paris, Paris",
      pickup_coordinates: { latitude: 48.856614, longitude: 2.3522219 },
      destination: "Tour Eiffel, Paris",
      destination_coordinates: { latitude: 48.858844, longitude: 2.2943506 },
      status: "pending",
      price: 15.50,
      created_at: new Date().toISOString(),
      scheduled_for: new Date(Date.now() + 3600000).toISOString()
    },
    {
      id: 2,
      user_id: userId,
      driver_id: "driver123",
      pickup_location: "456 Avenue des Champs-Élysées, Paris",
      pickup_coordinates: { latitude: 48.8697343, longitude: 2.3075649 },
      destination: "Arc de Triomphe, Paris",
      destination_coordinates: { latitude: 48.8737917, longitude: 2.2950275 },
      status: "completed",
      price: 12.75,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      scheduled_for: new Date(Date.now() - 82800000).toISOString()
    }
  ];
  
  // Filtrer par statut si spécifié
  const filteredRides = status ? rides.filter(ride => ride.status === status) : rides;
  
  res.json(filteredRides);
});

// Route pour récupérer les courses disponibles
app.get('/api/rides/available', (req, res) => {
  console.log('Récupération des courses disponibles');
  
  // Données de test
  const availableRides = [
    {
      id: 3,
      user_id: "user456",
      driver_id: null,
      pickup_location: "Gare du Nord, Paris",
      pickup_coordinates: { latitude: 48.8809, longitude: 2.3553 },
      destination: "Gare de Lyon, Paris",
      destination_coordinates: { latitude: 48.8448, longitude: 2.3735 },
      status: "pending",
      price: 18.25,
      created_at: new Date().toISOString(),
      scheduled_for: new Date(Date.now() + 1800000).toISOString()
    },
    {
      id: 4,
      user_id: "user789",
      driver_id: null,
      pickup_location: "Place de la Bastille, Paris",
      pickup_coordinates: { latitude: 48.8531, longitude: 2.3693 },
      destination: "Montmartre, Paris",
      destination_coordinates: { latitude: 48.8867, longitude: 2.3431 },
      status: "pending",
      price: 22.00,
      created_at: new Date().toISOString(),
      scheduled_for: new Date(Date.now() + 7200000).toISOString()
    }
  ];
  
  res.json(availableRides);
});

// Route pour récupérer les emplacements enregistrés
app.get('/api/locations', (req, res) => {
  console.log('Récupération des emplacements enregistrés');
  
  // Données de test
  const locations = [
    {
      id: 1,
      user_id: "1740687312140", // Utiliser l'ID de l'utilisateur actuel pour les tests
      name: "Maison",
      address: "123 Rue de la Paix, Paris",
      coordinates: { latitude: 48.8698, longitude: 2.3295 },
      is_favorite: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: "1740687312140", // Utiliser l'ID de l'utilisateur actuel pour les tests
      name: "Bureau",
      address: "456 Avenue des Affaires, Paris",
      coordinates: { latitude: 48.8742, longitude: 2.3470 },
      is_favorite: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      user_id: "1740687312140", // Utiliser l'ID de l'utilisateur actuel pour les tests
      name: "Gym",
      address: "789 Boulevard du Sport, Paris",
      coordinates: { latitude: 48.8610, longitude: 2.3350 },
      is_favorite: false,
      created_at: new Date().toISOString()
    }
  ];
  
  res.json(locations);
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible à http://localhost:${PORT}`);
});

export default app;
