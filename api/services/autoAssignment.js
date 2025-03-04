// server/autoAssignmentService.js
import { supabase } from './database.js';

/**
 * Service pour gérer l'assignation automatique des courses
 */
const autoAssignmentService = {
  /**
   * Assigne automatiquement une course lorsque son timer expire
   * @param {number} rideId - ID de la course à assigner
   * @returns {Promise<Object>} - Détails de l'assignation
   */
  autoAssignRide: async (rideId) => {
    try {
      // Vérifier si la course existe et est toujours en attente
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (rideError) {
        console.error('Erreur lors de la récupération de la course:', rideError);
        return { success: false, error: 'Erreur lors de la récupération de la course' };
      }

      if (!ride) {
        return { success: false, error: 'Course non trouvée' };
      }

      if (ride.status !== 'pending') {
        return { success: false, error: 'La course n\'est plus en attente' };
      }

      // Récupérer tous les chauffeurs intéressés par cette course
      const { data: interests, error: interestsError } = await supabase
        .from('ride_interests')
        .select('driver_id, created_at, latitude, longitude')
        .eq('ride_id', rideId);

      if (interestsError) {
        console.error('Erreur lors de la récupération des intérêts:', interestsError);
        return { success: false, error: 'Erreur lors de la récupération des intérêts' };
      }

      if (interests.length === 0) {
        return { success: false, error: 'Aucun chauffeur n\'a exprimé d\'intérêt pour cette course' };
      }

      // Trier les intérêts par ordre chronologique (premier arrivé, premier servi)
      // En cas réel, on pourrait utiliser d'autres critères comme la proximité, la note du chauffeur, etc.
      interests.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      // Sélectionner le chauffeur le plus approprié (ici, le premier qui a exprimé un intérêt)
      // S'assurer que le driver_id est une chaîne de caractères comme attendu par la base de données
      const assignedDriverId = interests[0].driver_id.toString();

      // Vérifier si le chauffeur n'est pas déjà assigné à une autre course
      const { data: driverAssignments, error: assignmentsError } = await supabase
        .from('rides')
        .select('id')
        .eq('assigned_to', assignedDriverId)
        .eq('status', 'assigned');

      if (assignmentsError) {
        console.error('Erreur lors de la vérification des assignations du chauffeur:', assignmentsError);
        // On continue quand même, ce n'est pas une erreur bloquante
      }

      // Logger les détails pour le débogage
      console.log(`Assignation de la course ${rideId} au chauffeur ${assignedDriverId} (${typeof assignedDriverId})`);
      console.log(`Détails des intérêts:`, JSON.stringify(interests));
      console.log(`Assignations existantes:`, driverAssignments ? JSON.stringify(driverAssignments) : 'aucune');

      // Mettre à jour la course avec les informations d'assignation
      const { error: updateError } = await supabase
        .from('rides')
        .update({
          assigned_to: assignedDriverId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', rideId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la course:', updateError);
        return { success: false, error: `Erreur lors de la mise à jour de la course: ${updateError.message}` };
      }

      // Récupérer les informations mises à jour de la course
      const { data: updatedRide, error: getRideError } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (getRideError) {
        console.error('Erreur lors de la récupération de la course mise à jour:', getRideError);
        return { success: false, error: 'Erreur lors de la récupération de la course mise à jour' };
      }

      return {
        success: true,
        data: updatedRide,
        message: `Course assignée au chauffeur ${assignedDriverId}`
      };
    } catch (error) {
      console.error('Erreur lors de l\'assignation automatique:', error);
      return { success: false, error: error.message };
    }
  }
};

export default autoAssignmentService;
