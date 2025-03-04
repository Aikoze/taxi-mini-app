// api/locations/index.js
import { createApiHandler, initSupabase } from '../_utils.js';

// Fonction API pour récupérer les emplacements enregistrés
async function locationsApi(req, res) {
  // Vérifier si la méthode est GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false, 
      error: 'Méthode non supportée'
    });
  }

  console.log('Récupération des emplacements enregistrés');
  const { category } = req.query;

  try {
    const supabase = initSupabase();
    
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    // Préparer la requête Supabase
    let query = supabase
      .from('saved_locations')
      .select('*')
      .eq('is_active', true);

    // Filtrer par catégorie si spécifiée
    if (category) {
      query = query.eq('category', category);
    }

    // Exécuter la requête
    const { data: locations, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des emplacements:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la récupération des emplacements' 
      });
    }

    // Transformer les données pour correspondre au format attendu par le client
    const formattedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      short_name: location.short_name,
      address: location.address,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      category: location.category,
      is_active: location.is_active,
      created_at: location.created_at
    }));

    return res.status(200).json(formattedLocations);
  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des emplacements' 
    });
  }
}

// Exporter la fonction compatible avec les fonctions serverless Vercel
export default createApiHandler(locationsApi);
