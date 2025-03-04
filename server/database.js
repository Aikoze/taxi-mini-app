// server/database.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Configuration de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Erreur: Variables d\'environnement Supabase non configurées!');
  process.exit(1);
}

// Création du client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
