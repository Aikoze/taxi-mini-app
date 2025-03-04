// api/base.js - Route racine de l'API au format Vercel serverless
import { setCorsHeaders } from './_utils.js';

export default function handler(req, res) {
  // Appliquer les en-têtes CORS avec la fonction mutualisée
  setCorsHeaders(res);

  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Renvoyer la liste des endpoints disponibles
  return res.status(200).json({
    success: true,
    message: 'API Taxi Mini App',
    version: '1.0.0',
    status: 'online',
    endpoints: [
      '/api/auth/validate',
      '/api/users',
      '/api/users/:userId/rides',
      '/api/rides',
      '/api/rides/:id',
      '/api/rides/available',
      '/api/interest/ride/:rideId',
      '/api/locations',
      '/api/stats/group',
      '/api/stats/user',
      '/api/stats/daily',
      '/api/debug'
    ]
  });
}
