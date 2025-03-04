// server/database.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Configuration de Supabase
// Utiliser les variables backend ou frontend comme fallback
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Erreur: Variables d\'environnement Supabase non configurées!');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL, 'VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.log('Environnement:', process.env);
}

// Création du client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
