// api/auth/validate.js
import { createApiHandler, initSupabase } from '../_utils.js';

/**
 * Validation de l'authentification d'un utilisateur Telegram
 * - Vérifie si l'utilisateur Telegram est déjà enregistré dans la base de données
 * - Renvoie les informations utilisateur si disponibles
 */
async function validateAuthApi(req, res) {
  // Seules les requêtes POST sont autorisées
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non autorisée'
    });
  }

  try {
    console.log('Headers de la requête:', JSON.stringify(req.headers, null, 2));
    console.log('Body de la requête:', JSON.stringify(req.body, null, 2));
    
    const { id } = req.body;

    if (!id) {
      console.warn('ID Telegram manquant dans la requête');
      return res.status(400).json({
        success: false,
        error: 'ID Telegram manquant'
      });
    }

    console.log('Validation de l\'authentification pour l\'ID Telegram:', id);

    // Initialiser Supabase
    const supabase = initSupabase();

    if (!supabase) {
      console.error('Impossible d\'initialiser Supabase');
      return res.status(500).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    // Rechercher l'utilisateur par son ID Telegram
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', id.toString())
      .single();

    if (error && error.code !== 'PGRST116') {
      // Erreur autre que "No rows found"
      console.error('Erreur lors de la recherche de l\'utilisateur:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche de l\'utilisateur',
        message: error.message
      });
    }

    // Créer l'objet de réponse
    const response = {
      isRegistered: !!user, // true si l'utilisateur est trouvé, false sinon
      user: user || null,
      telegramUser: {
        id: parseInt(id),
        // Ces champs seront complétés par le frontend si nécessaire
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        username: user?.username || ''
      }
    };

    // Renvoyer la réponse
    return res.status(200).json(response);

  } catch (error) {
    console.error('Erreur lors de la validation de l\'authentification:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la validation de l\'authentification',
      message: error.message
    });
  }
}

// Exporter la fonction compatible avec les fonctions serverless Vercel
export default createApiHandler(validateAuthApi);
