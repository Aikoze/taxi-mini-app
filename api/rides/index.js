// api/rides/index.js
import { createApiHandler, initSupabase } from '../_utils.js';
import TelegramBot from 'node-telegram-bot-api';

// Fonction pour créer un service Telegram simple
function createTelegramService() {
  // Initialiser le bot Telegram
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT;
  let bot = null;

  if (TELEGRAM_BOT_TOKEN) {
    try {
      bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
      console.log('Bot Telegram initialisé avec succès pour les fonctions serverless');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du bot Telegram:', error);
    }
  } else {
    console.warn('Token du bot Telegram non défini dans les variables d\'environnement');
  }

  // Retourner l'objet service avec juste la méthode dont nous avons besoin
  return {
    /**
     * Envoie une notification de nouvelle course au groupe
     * @param {Object} ride - Données de la course
     * @param {string} groupId - ID du groupe Telegram
     * @returns {Promise<Object|null>} - Résultat de l'envoi
     */
    sendNewRideNotification: async (ride, groupId) => {
      if (!bot || !groupId) {
        console.error('Bot Telegram non initialisé ou groupe non spécifié');
        return null;
      }

      // Créer un message formaté pour la notification
      const message = `
<b>🚕 Nouvelle course disponible !</b>

<b>Départ:</b> ${ride.pickup_address}
<b>Arrivée:</b> ${ride.dropoff_address}
<b>Date/Heure:</b> ${new Date(ride.pickup_datetime).toLocaleString('fr-FR')}
<b>Paiement:</b> ${ride.payment_method}

<i>Cliquez sur le bouton ci-dessous pour ouvrir l'application et voir les détails.</i>
`;

      try {
        // Créer le bouton qui redirige vers la mini app
        const inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: '🚕 Voir la course',
                url: `https://t.me/HeroadAppbot/Heroad?startapp=take-ride` // Lien vers la mini-app avec paramètre de démarrage
              }
            ]
          ]
        };

        // Envoyer le message avec le bouton
        const groupResult = await bot.sendMessage(groupId, message, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: inlineKeyboard
        });

        if (groupResult) {
          const supabase = initSupabase();
          if (supabase) {
            // Enregistrer le message dans la base de données
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

// Créer une instance du service Telegram
const telegramService = createTelegramService();

// Fonction API pour la gestion des courses
async function ridesApi(req, res) {
  // Méthode POST pour créer une nouvelle course
  if (req.method === 'POST') {
    console.log('Création d\'une nouvelle course:', req.body);

    try {
      const {
        userId,
        isImmediate,
        pickupDate,
        pickupTime,
        pickupLocation,
        dropoffLocation,
        clientPhone,
        paymentMethod
      } = req.body;

      if (!userId || !pickupLocation || !dropoffLocation || !paymentMethod) {
        return res.status(400).json({
          success: false,
          error: 'Données manquantes pour la création de la course'
        });
      }

      // Construire la date et heure de prise en charge
      let pickupDateTime;
      if (isImmediate) {
        // Si c'est immédiat, utiliser la date et l'heure actuelles
        pickupDateTime = new Date().toISOString();
      } else {
        // Sinon, combiner la date et l'heure fournies
        if (!pickupDate || !pickupTime) {
          return res.status(400).json({
            success: false,
            error: 'Date ou heure de prise en charge manquante'
          });
        }
        pickupDateTime = `${pickupDate}T${pickupTime}:00`;
      }

      // Préparer les données pour l'insertion dans Supabase
      const rideData = {
        created_by: userId,
        is_immediate: isImmediate,
        pickup_datetime: pickupDateTime,
        pickup_address: pickupLocation.address,
        pickup_lat: pickupLocation.latitude || null,
        pickup_lng: pickupLocation.longitude || null,
        pickup_location_id: pickupLocation.id || null,
        dropoff_address: dropoffLocation.address,
        dropoff_location_id: dropoffLocation.id || null,
        client_phone: clientPhone || null,
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString(),
        current_group_id: '@TaxiDispatchMarseille'
      };

      const supabase = initSupabase();
      
      // Insérer la course dans Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('rides')
          .insert([rideData])
          .select()
          .single();

        if (error) {
          console.error('Erreur Supabase lors de la création de la course:', error);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement de la course',
            message: error.message
          });
        }
        console.log(data);
        // Envoyer une notification Telegram si un groupe est spécifié
        if (data.current_group_id) {
          try {
            const result = await telegramService.sendNewRideNotification(data, data.current_group_id);
            if (result) {
              console.log('Notification Telegram envoyée avec succès au groupe', data.current_group_id);
            } else {
              console.warn('La notification Telegram n\'a pas pu être envoyée au groupe', data.current_group_id);
            }
          } catch (notifError) {
            console.error('Erreur lors de l\'envoi de la notification Telegram:', notifError);
            // Ne pas bloquer la réponse en cas d'erreur de notification
          }
        }

        return res.status(201).json({
          success: true,
          data: data
        });
      } else {
        console.warn('Supabase non initialisé, impossible de créer la course');
        return res.status(503).json({
          success: false,
          error: 'Service de base de données non disponible'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la course:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la création de la course'
      });
    }
  } else {
    // Méthode non supportée
    return res.status(405).json({
      success: false,
      error: 'Méthode non supportée'
    });
  }
}

// Exporter la fonction compatible avec les fonctions serverless Vercel
export default createApiHandler(ridesApi);
