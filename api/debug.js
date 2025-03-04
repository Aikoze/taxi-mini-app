// api/debug.js
import express from 'express';
import dotenv from 'dotenv';

// Configuration
dotenv.config({ path: './server/.env' });
const app = express();

app.get('/api/debug', (req, res) => {
  // Récupérer toutes les variables d'environnement, mais masquer les valeurs sensibles
  const safeEnv = {};
  for (const key in process.env) {
    if (key.includes('KEY') || key.includes('TOKEN') || key.includes('SECRET')) {
      safeEnv[key] = 'VALEUR_MASQUÉE_POUR_SÉCURITÉ';
    } else {
      safeEnv[key] = process.env[key];
    }
  }

  // Créer un résumé des variables d'environnement importantes
  const summary = {
    supabase: {
      url: {
        backend: process.env.SUPABASE_URL ? 'défini' : 'non défini',
        frontend: process.env.VITE_SUPABASE_URL ? 'défini' : 'non défini'
      },
      key: {
        backend: process.env.SUPABASE_KEY ? 'défini' : 'non défini',
        frontend: process.env.VITE_SUPABASE_ANON_KEY ? 'défini' : 'non défini'
      }
    },
    telegram: {
      backend: process.env.TELEGRAM_BOT_TOKEN ? 'défini' : 'non défini',
      frontend: process.env.VITE_TELEGRAM_BOT ? 'défini' : 'non défini'
    },
    api: {
      url: process.env.VITE_API_URL || 'non défini'
    },
    node_env: process.env.NODE_ENV || 'non défini'
  };

  res.json({
    summary,
    environment: safeEnv
  });
});

export default app;
