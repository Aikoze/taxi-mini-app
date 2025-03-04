// api/users/[userId]/rides.js
import { createApiHandler, initSupabase } from '../../_utils.js';

// Fonction API pour récupérer les courses d'un utilisateur
async function userRidesApi(req, res) {
  // Vérifier si la méthode est GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non supportée'
    });
  }

  // Récupérer userId des paramètres de la route
  const userId = req.query.userId;
  const { status } = req.query;

  console.log(`Récupération des courses pour l'utilisateur ${userId}${status ? ` avec statut ${status}` : ''}`);

  try {
    const supabase = initSupabase();
    
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    // Préparer la requête pour récupérer les courses de l'utilisateur
    let query = supabase
      .from('rides')
      .select(`
        *,
        pickup_location:saved_locations!pickup_location_id(*),
        dropoff_location:saved_locations!dropoff_location_id(*),
        assigned_driver:users!rides_assigned_to_fkey(*)
      `)
      .order('pickup_datetime', { ascending: false })
      .eq('created_by', userId);

    // Filtrer par statut si spécifié
    if (status) {
      query = query.eq('status', status);
    }

    // Exécuter la requête
    const { data: rides, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des courses',
        message: error.message
      });
    }

    // Transformer les données pour correspondre au format attendu par le client
    const formattedRides = rides.map(ride => ({
      id: ride.id,
      created_by: ride.created_by,
      is_immediate: ride.is_immediate,
      pickup_datetime: ride.pickup_datetime,
      pickup_address: ride.pickup_address,
      pickup_lat: ride.pickup_lat,
      pickup_lng: ride.pickup_lng,
      dropoff_address: ride.dropoff_address,
      client_phone: ride.client_phone,
      payment_method: ride.payment_method,
      status: ride.status,
      assigned_to: ride.assigned_to,
      current_group_id: ride.current_group_id,
      created_at: ride.created_at,
      completed_at: ride.completed_at,
      pickup_location_id: ride.pickup_location_id,
      dropoff_location_id: ride.dropoff_location_id,
      pickup_location: ride.pickup_location,
      dropoff_location: ride.dropoff_location,
      assigned_driver: ride.assigned_driver
    }));

    return res.status(200).json(formattedRides);
  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des courses'
    });
  }
}

// Exporter la fonction compatible avec les fonctions serverless Vercel
export default createApiHandler(userRidesApi);
