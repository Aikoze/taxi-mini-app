// api/interest/ride/[rideId].js
import { createApiHandler, initSupabase } from '../../_utils.js';

// Fonction API pour qu'un chauffeur manifeste son intérêt pour une course
async function rideInterestApi(req, res) {
  // Vérifier si la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false, 
      error: 'Méthode non supportée'
    });
  }

  const { rideId } = req.query;
  const { driverId, latitude, longitude } = req.body;

  console.log(`Chauffeur ${driverId} manifeste son intérêt pour la course ${rideId}`, { latitude, longitude });

  try {
    const supabase = initSupabase();
    
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    if (!driverId || !rideId) {
      return res.status(400).json({
        success: false,
        error: 'ID du chauffeur et ID de la course sont requis'
      });
    }

    // Vérifier si la course existe et est toujours en attente
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .eq('status', 'pending')
      .single();

    if (rideError || !ride) {
      console.error('Erreur lors de la vérification de la course:', rideError);
      return res.status(404).json({
        success: false,
        error: 'Course non trouvée ou non disponible',
        message: rideError?.message
      });
    }

    // Vérifier si le chauffeur a déjà manifesté son intérêt
    const { data: existingInterest, error: interestError } = await supabase
      .from('ride_interests')
      .select('*')
      .eq('ride_id', rideId)
      .eq('driver_id', driverId)
      .single();

    if (existingInterest) {
      // Mettre à jour l'intérêt existant avec les nouvelles coordonnées
      const { data: updatedInterest, error: updateError } = await supabase
        .from('ride_interests')
        .update({
          latitude: latitude || existingInterest.latitude,
          longitude: longitude || existingInterest.longitude,
          created_at: new Date().toISOString()
        })
        .eq('id', existingInterest.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'intérêt:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la mise à jour de l\'intérêt',
          message: updateError.message
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedInterest,
        message: 'Intérêt mis à jour avec succès'
      });
    } else {
      // Créer un nouvel intérêt
      const interestData = {
        driver_id: driverId,
        ride_id: parseInt(rideId),
        latitude: latitude || 0,
        longitude: longitude || 0,
        created_at: new Date().toISOString()
      };

      const { data: newInterest, error: createError } = await supabase
        .from('ride_interests')
        .insert([interestData])
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création de l\'intérêt:', createError);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de l\'enregistrement de l\'intérêt',
          message: createError.message
        });
      }

      return res.status(201).json({
        success: true,
        data: newInterest,
        message: 'Intérêt enregistré avec succès'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la manifestation d\'intérêt:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la manifestation d\'intérêt'
    });
  }
}

// Exporter la fonction compatible avec les fonctions serverless Vercel
export default createApiHandler(rideInterestApi);
