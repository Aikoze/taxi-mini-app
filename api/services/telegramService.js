
/**
 * Service pour gérer les notifications Telegram
 */
const telegramService = {
  /**
   * Envoie une notification à un groupe Telegram
   * @param {string} chatId - ID du chat/groupe Telegram
   * @param {string} message - Message à envoyer
   * @returns {Promise<Object|null>} - Réponse de l'API Telegram ou null en cas d'erreur
   */
  sendToGroup: async (chatId, message) => {
    if (!bot) {
      console.error('Bot Telegram non initialisé');
      return null;
    }

    try {
      const response = await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      console.log(`Message envoyé au groupe ${chatId}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de l'envoi du message au groupe ${chatId}:`, error);
      return null;
    }
  },

  /**
   * Envoie une notification à un utilisateur Telegram
   * @param {string} userId - ID de l'utilisateur Telegram
   * @param {string} message - Message à envoyer
   * @returns {Promise<Object|null>} - Réponse de l'API Telegram ou null en cas d'erreur
   */
  sendToUser: async (userId, message) => {
    if (!bot) {
      console.error('Bot Telegram non initialisé');
      return null;
    }

    try {
      const response = await bot.sendMessage(userId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      console.log(`Message envoyé à l'utilisateur ${userId}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de l'envoi du message à l'utilisateur ${userId}:`, error);
      return null;
    }
  },

  /**
   * Récupère les utilisateurs associés à un groupe
   * @param {string} groupId - ID du groupe Telegram
   * @returns {Promise<Array>} - Liste des utilisateurs du groupe
   */
  getUsersByGroupId: async (groupId) => {
    try {
      // Dans un système réel, cette méthode récupérerait tous les utilisateurs d'un groupe Telegram
      // Pour l'instant, on va simuler en récupérant tous les utilisateurs
      const { data, error } = await supabase
        .from('users')
        .select('telegram_id')
        .not('telegram_id', 'is', null);

      if (error) {
        console.error(`Erreur lors de la récupération des utilisateurs du groupe ${groupId}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Exception lors de la récupération des utilisateurs du groupe ${groupId}:`, error);
      return [];
    }
  },

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

        console.log(`Notification envoyée avec succès au groupe ${groupId}`);
        return groupResult;
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de l'envoi au groupe ${groupId}:`, error);
      return null;
    }
  },

  /**
   * Envoie une notification de mise à jour de statut de course 
   * @param {Object} ride - Données de la course
   * @param {string} previousStatus - Statut précédent de la course
   * @param {string} newStatus - Nouveau statut de la course
   * @returns {Promise<Array>} - Tableau des résultats des envois
   */
  sendRideStatusUpdateNotification: async (ride, previousStatus, newStatus) => {
    if (!bot) {
      console.error('Bot Telegram non initialisé');
      return [];
    }

    // Rechercher les messages parents dans ride_messages pour cette course
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('ride_messages')
        .select('*')
        .eq('ride_id', ride.id)
        .eq('is_parent', true);

      if (messagesError) {
        console.error('Erreur lors de la récupération des messages de la course:', messagesError);
        return [];
      }

      if (!messages || messages.length === 0) {
        console.log('Aucun message parent trouvé pour cette course, impossible d\'envoyer une mise à jour');
        return [];
      }

      // Préparer les informations supplémentaires en fonction du statut
      let additionalInfo = '';

      // Pour les courses attribuées, ajouter des informations de reporting
      if (newStatus === 'assigned') {
        // Récupérer les détails d'attribution s'ils existent
        let assignmentDetails = null;
        try {
          const { data, error } = await supabase
            .from('ride_assignments')
            .select('*')
            .eq('ride_id', ride.id)
            .single();

          if (!error && data) {
            assignmentDetails = data;
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des détails d\'attribution:', err);
        }

        // Informations sur le chauffeur assigné
        let driverInfo = 'Informations non disponibles';
        if (ride.assigned_to) {
          try {
            const { data: driver, error } = await supabase
              .from('users')
              .select('*')
              .eq('telegram_id', ride.assigned_to)
              .single();

            if (!error && driver) {
              driverInfo = `${driver.first_name} ${driver.last_name || ''} - ${driver.phone_number || 'Tél non disponible'}`;
            }
          } catch (err) {
            console.error('Erreur lors de la récupération des informations du chauffeur:', err);
          }
        }

        // Ajouter les informations du chauffeur
        additionalInfo += `\n<b>Course attribuée à:</b> ${driverInfo}\n`;

        // Ajouter des informations de reporting si disponibles
        if (assignmentDetails) {
          try {
            const isProximityBased = assignmentDetails.assignment_type === 'proximity';
            const topDrivers = JSON.parse(assignmentDetails.driver_ranking || '[]');

            additionalInfo += `\n<b>Méthode d'attribution:</b> ${isProximityBased ? 'Proximité (chauffeur le plus proche)' : 'Aléatoire'}`;

            if (isProximityBased && assignmentDetails.driver_distance) {
              additionalInfo += `\n<b>Distance:</b> ${assignmentDetails.driver_distance.toFixed(2)} km`;
            }

            if (topDrivers && topDrivers.length > 0) {
              additionalInfo += `\n\n<b>Top ${Math.min(5, topDrivers.length)} des chauffeurs intéressés:</b>`;

              topDrivers.forEach((driver, index) => {
                const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Chauffeur';
                let infoLine = `\n${index + 1}. ${driverName}`;

                if (isProximityBased && driver.distance) {
                  infoLine += ` - ${driver.distance.toFixed(2)} km`;
                }

                additionalInfo += infoLine;
              });
            }
          } catch (err) {
            console.error('Erreur lors de la préparation du reporting:', err);
          }
        }
      }

      // Générer le message de mise à jour
      const updateMessage = `
<b>🚦 Mise à jour de course !</b>

<b>Statut mis à jour :</b> <i>${previousStatus}</i> → <b>${newStatus}</b>

<b>Départ:</b> ${ride.pickup_address}
<b>Arrivée:</b> ${ride.dropoff_address}
<b>Date/Heure:</b> ${new Date(ride.pickup_datetime).toLocaleString('fr-FR')}${additionalInfo}

<i>Cliquez sur le bouton ci-dessous pour voir les détails.</i>
`;

      const results = [];

      // Créer le bouton qui redirige vers la mini app
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: '💡 Voir les détails',
              url: `https://t.me/TaxiMiniDispatchBot/app?startapp=ride_${ride.id}`
            }
          ]
        ]
      };

      // Pour chaque message parent, envoyer une réponse
      const messagePromises = messages.map(async (messageData) => {
        try {
          const replyResult = await bot.sendMessage(messageData.group_id, updateMessage, {
            reply_to_message_id: messageData.message_id,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: inlineKeyboard
          });

          if (replyResult) {
            // Enregistrer la réponse dans la base de données
            try {
              const { data: childMessage, error: childError } = await supabase
                .from('ride_messages')
                .insert({
                  ride_id: ride.id,
                  group_id: messageData.group_id,
                  message_id: replyResult.message_id,
                  parent_message_id: messageData.message_id,
                  is_parent: false
                })
                .select()
                .single();

              if (childError) {
                console.error('Erreur lors de l\'enregistrement de la réponse:', childError);
              }
            } catch (dbError) {
              console.error('Exception lors de l\'enregistrement de la réponse:', dbError);
            }

            return { type: 'reply', id: messageData.group_id, success: true, message_id: replyResult.message_id };
          }
          return { type: 'reply', id: messageData.group_id, success: false };
        } catch (error) {
          console.error(`Erreur lors de l'envoi de la réponse au groupe ${messageData.group_id}:`, error);
          return { type: 'reply', id: messageData.group_id, success: false, error: error.message };
        }
      });

      const messageResults = await Promise.all(messagePromises);
      results.push(...messageResults);

      return results;
    } catch (error) {
      console.error('Exception lors de l\'envoi des notifications de mise à jour:', error);
      return [];
    }
  }
};

export default telegramService;
