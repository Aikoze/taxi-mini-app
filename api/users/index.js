// api/users/index.js
import { createApiHandler, initSupabase } from '../_utils.js';

// Fonction API pour l'enregistrement d'un utilisateur
async function usersApi(req, res) {
  // POST - Création d'un utilisateur
  if (req.method === 'POST') {
    try {
      const { telegramUser, phone, email, address } = req.body;

      if (!telegramUser || !telegramUser.id) {
        return res.status(400).json({
          success: false,
          error: 'Données utilisateur Telegram manquantes'
        });
      }

      // Créer l'utilisateur dans la base de données
      const user = {
        telegram_id: telegramUser.id.toString(),
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || null,
        username: telegramUser.username || null,
        phone: phone,
        email: email,
        address: address,
        created_at: new Date().toISOString()
      };

      const supabase = initSupabase();
      
      // Enregistrer l'utilisateur dans Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('users')
            .insert([user])
            .select()
            .single();

          if (error) {
            console.error('Erreur Supabase lors de l\'insertion utilisateur:', error);
            return res.status(500).json({
              success: false,
              error: 'Erreur lors de l\'enregistrement dans la base de données',
              message: error.message
            });
          }

          return res.status(201).json({
            success: true,
            data: data,
            message: 'Utilisateur enregistré avec succès'
          });
        } catch (supabaseError) {
          console.error('Erreur lors de la requête Supabase:', supabaseError);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de la requête à la base de données',
            message: supabaseError.message
          });
        }
      } else {
        // Mode sans Supabase (développement)
        console.warn('Supabase non initialisé, simulation d\'enregistrement utilisateur');

        // Ajouter un ID simulé
        user.id = Date.now();

        return res.status(201).json({
          success: true,
          data: user,
          message: 'Utilisateur enregistré avec succès (mode simulation)'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enregistrement de l\'utilisateur',
        message: error.message
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
export default createApiHandler(usersApi);
