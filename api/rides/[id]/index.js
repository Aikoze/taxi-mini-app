// api/rides/[id]/index.js
import { createApiHandler, initSupabase } from '../../_utils.js';

// Fonction API pour récupérer une course par son ID
async function rideByIdApi(req, res) {
  // GET - Récupérer la course par son ID
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      console.log(`Récupération de la course avec ID ${id}`);

      const supabase = initSupabase();
      
      if (!supabase) {
        return res.status(500).json({
          success: false,
          error: 'Service Supabase non disponible'
        });
      }

      const { data, error } = await supabase
        .from('rides')
        .select(`
          *
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.log(error);
        console.error(`Erreur lors de la récupération de la course ${id}:`, error);
        return res.status(404).json({
          success: false,
          error: 'Course non trouvée'
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la course:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération de la course'
      });
    }
  } 
  // PATCH - Mettre à jour une course
  else if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const updates = req.body;

      // Empêcher la mise à jour de certains champs sensibles
      const protectedFields = ['id', 'created_by', 'created_at'];
      protectedFields.forEach(field => {
        if (updates[field] !== undefined) {
          delete updates[field];
        }
      });

      const supabase = initSupabase();
      
      if (!supabase) {
        return res.status(500).json({
          success: false,
          error: 'Service Supabase non disponible'
        });
      }

      // Si le statut est modifié, enregistrer l'ancien statut
      let oldStatus = null;
      if (updates.status) {
        try {
          const { data: currentRide } = await supabase
            .from('rides')
            .select('status')
            .eq('id', id)
            .single();

          if (currentRide) {
            oldStatus = currentRide.status;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du statut actuel:', error);
        }
      }

      // Mettre à jour la course
      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Erreur lors de la mise à jour de la course ${id}:`, error);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la mise à jour de la course',
          message: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data,
        oldStatus
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la course:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la mise à jour de la course'
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
export default createApiHandler(rideByIdApi);
