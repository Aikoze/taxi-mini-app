// api/_utils.js
import { createClient } from '@supabase/supabase-js';
import TelegramBot from 'node-telegram-bot-api';

// Configuration des en-têtes CORS
export function setCorsHeaders(res) {
  // Détecter l'origine depuis l'en-tête de la requête (si disponible)
  const requestOrigin = res.req?.headers?.origin || res.req?.headers?.referer;

  // Définir les origines autorisées
  const allowedOrigins = [
    'http://localhost:5173',                       // Développement local
    'https://taxi-mini-app.vercel.app',            // Application déployée
    'https://web.telegram.org',                    // Telegram Web Client
    'https://tg.dev',                              // Environnement de test Telegram
  ];

  // Vérifier si l'origine est dans les origines autorisées ou commence par une des origines autorisées
  // Dans le cas de Telegram, l'origine peut être https://web.telegram.org/k/ ou similaire
  let originToUse = allowedOrigins[0]; // Défaut
  
  if (requestOrigin) {
    // Vérifier si l'origine de la requête correspond à une des origines autorisées
    const matchingOrigin = allowedOrigins.find(allowed => 
      requestOrigin === allowed || requestOrigin.startsWith(`${allowed}/`)
    );
    
    if (matchingOrigin) {
      originToUse = requestOrigin;
    } else {
      console.warn(`Origine non reconnue: ${requestOrigin}`);
    }
  }

  // En production, utiliser l'origine demandée si elle est dans la liste des autorisées
  // Sinon, utiliser l'origine par défaut de l'application
  const origin = process.env.VERCEL ? originToUse : 'http://localhost:5173';
    
  console.log(`CORS: Autorisation de l'origine ${origin}`);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
}

// Initialisation de Supabase
export function initSupabase() {
  // Utiliser les variables backend ou frontend comme fallback
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Variables SUPABASE_URL et SUPABASE_KEY manquantes dans l\'environnement');
    console.log('Environment disponible:', {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'défini' : 'non défini',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'défini' : 'non défini',
      NODE_ENV: process.env.NODE_ENV
    });
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Service Telegram simplifié
export function getTelegramService() {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT;
  let bot = null;

  if (TELEGRAM_BOT_TOKEN) {
    try {
      bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
      console.log('Bot Telegram initialisé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du bot Telegram:', error);
    }
  } else {
    console.warn('Token du bot Telegram non défini dans les variables d\'environnement');
  }

  // Service minimal pour la notification
  return {
    sendNewRideNotification: async (ride, groupId) => {
      if (!bot || !groupId) {
        console.error('Bot Telegram non initialisé ou groupe non spécifié');
        return null;
      }

      const message = `
<b>🚕 Nouvelle course disponible !</b>

<b>Départ:</b> ${ride.pickup_address}
<b>Arrivée:</b> ${ride.dropoff_address}
<b>Date/Heure:</b> ${new Date(ride.pickup_datetime).toLocaleString('fr-FR')}
<b>Paiement:</b> ${ride.payment_method}

<i>Cliquez sur le bouton ci-dessous pour ouvrir l'application et voir les détails.</i>
`;

      try {
        const inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: '🚕 Voir la course',
                url: `https://t.me/HeroadAppbot/Heroad?startapp=take-ride`
              }
            ]
          ]
        };

        const groupResult = await bot.sendMessage(groupId, message, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: inlineKeyboard
        });

        if (groupResult) {
          const supabase = initSupabase();
          if (supabase) {
            try {
              const { data: messageData, error: messageError } = await supabase
                .from('ride_messages')
                .insert({
                  ride_id: ride.id,
                  group_id: groupId,
                  message_id: groupResult.message_id,
                  is_parent: true
                })
                .select()
                .single();

              if (messageError) {
                console.error('Erreur lors de l\'enregistrement du message dans la base de données:', messageError);
              } else {
                console.log('Message enregistré dans la base de données:', messageData);
              }
            } catch (dbError) {
              console.error('Exception lors de l\'enregistrement du message:', dbError);
            }
          }

          console.log(`Notification envoyée avec succès au groupe ${groupId}`);
          return groupResult;
        }
        return null;
      } catch (error) {
        console.error(`Erreur lors de l'envoi au groupe ${groupId}:`, error);
        return null;
      }
    }
  };
}

// Import des services
export async function importServices() {
  try {
    // Import dynamique des services depuis le répertoire /api
    const { default: rideAssignmentServiceModule } = await import('./services/rideAssignment.js');
    const { default: autoAssignmentServiceModule } = await import('./services/autoAssignment.js');
    const { default: statsServiceModule } = await import('./services/statsService.js');
    
    const supabase = initSupabase();

    return {
      telegramService: getTelegramService(), // Service Telegram unifié
      rideAssignmentService: rideAssignmentServiceModule,
      autoAssignmentService: autoAssignmentServiceModule,
      statsService: statsServiceModule,
      supabase
    };
  } catch (error) {
    console.error('Erreur lors de l\'import des services:', error);
    return {
      telegramService: getTelegramService(), // Service Telegram unifié
      rideAssignmentService: null,
      autoAssignmentService: null,
      statsService: null,
      supabase: initSupabase()
    };
  }
}

// Crée une enveloppe pour les fonctions API
// Cette fonction prend une fonction de gestionnaire d'API et renvoie
// une fonction compatible avec les fonctions serverless Vercel
export function createApiHandler(apiFunction) {
  return async function handler(req, res) {
    // Configuration CORS
    setCorsHeaders(res);
    
    // Gérer les requêtes OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Appeler la fonction API réelle
    try {
      return await apiFunction(req, res);
    } catch (error) {
      console.error('Erreur dans la fonction API:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  };
}
