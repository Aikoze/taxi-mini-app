// api/rides/available.js
import { createApiHandler, initSupabase } from '../_utils.js';

// Fonction API pour récupérer les courses disponibles
async function availableRidesApi(req, res) {
  // Vérifier si la méthode est GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false, 
      error: 'Méthode non supportée'
    });
  }

  console.log('Récupération des courses disponibles');

  try {
    const supabase = initSupabase();
    
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    // Récupérer les courses disponibles (status = 'pending' et pas encore assignées)
    const { data: rides, error } = await supabase
      .from('rides')
      .select(`
        *,
        pickup_location:saved_locations!pickup_location_id(*),
        dropoff_location:saved_locations!dropoff_location_id(*)
      `)
      .eq('status', 'pending')
      .order('pickup_datetime', { ascending: false })
      .is('assigned_to', null);

    if (error) {
      console.error('Erreur lors de la récupération des courses disponibles:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des courses disponibles',
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
      dropoff_location: ride.dropoff_location
    }));

    return res.status(200).json(formattedRides);
  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des courses disponibles'
    });
  }
}

// Exporter la fonction compatible avec les fonctions serverless Vercel
export default createApiHandler(availableRidesApi);
