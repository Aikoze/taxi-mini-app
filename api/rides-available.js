// api/rides-available.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Configuration
dotenv.config({ path: './server/.env' });
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialisation de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Créer une application Express
const app = express();

// Route pour récupérer les courses disponibles
app.get('/api/rides/available', async (req, res) => {
  console.log('Récupération des courses disponibles');

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Service Supabase non disponible',
        data: []
      });
    }

    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        ride_interests (
          *,
          driver:users (
            id,
            first_name,
            last_name,
            username,
            phone_number
          )
        )
      `)
      .or('status.eq.pending,status.eq.accepted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des courses',
        error: error.message
      });
    }

    // Formater les résultats
    const rides = data.map(ride => ({
      ...ride,
      interests: ride.ride_interests || []
    }));

    res.json({
      success: true,
      data: rides
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des courses',
      error: error.message
    });
  }
});

// Export pour Vercel
export default app;
