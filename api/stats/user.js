// /api/stats/user.js - Endpoint pour récupérer les statistiques d'un utilisateur
import statsService from '../services/statsService.js';
import { setCorsHeaders } from '../_utils.js';

export default async function handler(req, res) {
  // Configuration CORS
  setCorsHeaders(res);
  
  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis'
      });
    }

    console.log(`Récupération des statistiques pour l'utilisateur ${userId} (API Vercel)`);
    
    const stats = await statsService.getUserStats(userId);
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques utilisateur:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques utilisateur',
      error: error.message
    });
  }
}
