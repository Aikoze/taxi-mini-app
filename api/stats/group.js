// /api/stats/group.js - Endpoint pour récupérer les statistiques globales
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
    console.log('Récupération des statistiques globales du groupe (API Vercel)');
    
    const stats = await statsService.getGroupStats();
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du groupe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
}
