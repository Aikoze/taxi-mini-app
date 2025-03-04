// server/rideAssignmentService.js
import { initSupabase, getTelegramService } from '../_utils.js';


/**
 * Calcule la distance entre deux points géographiques en kilomètres (formule de Haversine)
 * @param {number} lat1 - Latitude du point 1
 * @param {number} lon1 - Longitude du point 1
 * @param {number} lat2 - Latitude du point 2
 * @param {number} lon2 - Longitude du point 2
 * @returns {number} Distance en kilomètres
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Service pour gérer l'attribution des courses
 */
const rideAssignmentService = {
  /**
   * Vérifie les courses dont le timer est expiré et les attribue aux chauffeurs
   */
  assignExpiredRides: async () => {
    try {
      // Récupérer les courses en attente
      const { data: pendingRides, error: ridesError } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'pending');

      if (ridesError) {
        console.error('Erreur lors de la récupération des courses en attente:', ridesError);
        return;
      }

      if (!pendingRides || pendingRides.length === 0) {
        console.log('Aucune course en attente à traiter');
        return;
      }

      console.log(`Vérification de ${pendingRides.length} courses en attente pour attribution...`);

      const currentTime = new Date();
      const processedRides = [];

      // Vérifier chaque course en attente
      for (const ride of pendingRides) {
        const createdAt = new Date(ride.created_at);
        const timeoutInMinutes = ride.is_immediate ? 2 : 30; // 2 minutes pour courses immédiates, 30 minutes pour programmées
        const expirationTime = new Date(createdAt.getTime() + timeoutInMinutes * 60000);

        // Si le timer a expiré
        if (currentTime >= expirationTime) {
          console.log(`La course #${ride.id} a expiré le timer, attribution en cours...`);

          try {
            // Récupérer tous les intérêts pour cette course
            const { data: interests, error: interestsError } = await supabase
              .from('ride_interests')
              .select(`
                id,
                driver_id,
                latitude,
                longitude,
                created_at,
                users:driver_id (
                  id,
                  telegram_id,
                  first_name,
                  last_name,
                  phone_number
                )
              `)
              .eq('ride_id', ride.id);

            if (interestsError) {
              console.error(`Erreur lors de la récupération des intérêts pour la course #${ride.id}:`, interestsError);
              continue;
            }

            if (!interests || interests.length === 0) {
              console.log(`Aucun intérêt pour la course #${ride.id}, la course reste en attente`);
              continue;
            }

            let assignedDriver = null;
            let driverDistance = null;
            let driversRanking = [];

            // Traitement différent selon le type de course
            if (ride.is_immediate) {
              // Pour les courses immédiates: attribuer au chauffeur le plus proche
              console.log(`Attribution de la course immédiate #${ride.id} au chauffeur le plus proche`);

              // Calculer la distance pour chaque chauffeur intéressé
              driversRanking = interests.map(interest => {
                const distance = calculateDistance(
                  interest.latitude,
                  interest.longitude,
                  ride.pickup_lat || 0,
                  ride.pickup_lng || 0
                );

                // Estimer le temps d'arrivée (supposons une vitesse moyenne de 40 km/h en ville)
                // Convertir en minutes
                const estimatedTimeMinutes = Math.round((distance / 40) * 60);

                return {
                  driverId: interest.driver_id,
                  distance: parseFloat(distance.toFixed(2)), // Arrondir à 2 décimales pour lisibilité
                  distanceKm: parseFloat(distance.toFixed(2)),
                  estimatedTimeMinutes: estimatedTimeMinutes,
                  firstName: interest.users?.first_name,
                  lastName: interest.users?.last_name,
                  phoneNumber: interest.users?.phone_number,
                  createdAt: interest.created_at
                };
              });

              // Trier par distance (du plus proche au plus éloigné)
              driversRanking.sort((a, b) => a.distance - b.distance);

              // Sélectionner le premier (le plus proche)
              if (driversRanking.length > 0) {
                assignedDriver = driversRanking[0].driverId;
                driverDistance = driversRanking[0].distance;
              }
            } else {
              // Pour les courses programmées: attribuer au hasard
              console.log(`Attribution de la course programmée #${ride.id} à un chauffeur au hasard`);

              // Créer la liste des chauffeurs pour le reporting
              driversRanking = interests.map(interest => {
                // Pour les courses programmées, calculer aussi la distance pour information
                const distance = calculateDistance(
                  interest.latitude,
                  interest.longitude,
                  ride.pickup_lat || 0,
                  ride.pickup_lng || 0
                );

                // Estimer le temps d'arrivée
                const estimatedTimeMinutes = Math.round((distance / 40) * 60);

                return {
                  driverId: interest.driver_id,
                  distance: parseFloat(distance.toFixed(2)),
                  distanceKm: parseFloat(distance.toFixed(2)),
                  estimatedTimeMinutes: estimatedTimeMinutes,
                  firstName: interest.users?.first_name,
                  lastName: interest.users?.last_name,
                  phoneNumber: interest.users?.phone_number,
                  createdAt: interest.created_at
                };
              });

              // Sélectionner un chauffeur au hasard
              const randomIndex = Math.floor(Math.random() * interests.length);
              assignedDriver = interests[randomIndex].driver_id;
            }

            if (assignedDriver) {
              // Mettre à jour la course avec le chauffeur assigné
              const { data: updatedRide, error: updateError } = await supabase
                .from('rides')
                .update({
                  status: 'assigned',
                  assigned_to: assignedDriver
                })
                .eq('id', ride.id)
                .select()
                .single();

              if (updateError) {
                console.error(`Erreur lors de l'attribution de la course #${ride.id}:`, updateError);
                continue;
              }

              console.log(`Course #${ride.id} attribuée au chauffeur ${assignedDriver}`);

              // Stocker les données pour le reporting
              processedRides.push({
                ride: updatedRide,
                assignedDriver,
                driverDistance,
                driversRanking: driversRanking.slice(0, 5) // Top 5 des chauffeurs
              });

              // Stocker les informations d'attribution dans la table ride_assignments
              try {
                // Trouver les détails du chauffeur assigné
                const assignedDriverDetails = driversRanking.find(driver => driver.driverId === assignedDriver);
                const estimateMinutes = assignedDriverDetails?.estimatedTimeMinutes || null;

                // Préparer des données plus détaillées sur tous les chauffeurs
                const driverDetails = driversRanking.map(driver => ({
                  driverId: driver.driverId,
                  fullName: `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
                  distance: driver.distance,
                  estimatedTimeMinutes: driver.estimatedTimeMinutes,
                  phoneNumber: driver.phoneNumber,
                  interestShownAt: driver.createdAt
                }));

                const { error: insertError } = await supabase
                  .from('ride_assignments')
                  .insert({
                    ride_id: ride.id,
                    assigned_driver: assignedDriver,
                    assignment_type: ride.is_immediate ? 'proximity' : 'random',
                    driver_distance: driverDistance,
                    driver_ranking: JSON.stringify(driversRanking.slice(0, 5)),
                    driver_details: JSON.stringify(driverDetails),
                    estimate_minutes: estimateMinutes,
                    assignment_rules: JSON.stringify({
                      criteriaUsed: ride.is_immediate ? 'distance' : 'random',
                      selectionTime: new Date().toISOString(),
                      totalCandidates: interests.length
                    }),
                    created_at: new Date().toISOString()
                  });

                if (insertError) {
                  console.error(`Erreur lors de l'enregistrement des données d'attribution pour la course #${ride.id}:`, insertError);
                } else {
                  console.log(`Données d'attribution pour la course #${ride.id} enregistrées avec succès`);
                }
              } catch (insertError) {
                console.error(`Exception lors de l'enregistrement des données d'attribution pour la course #${ride.id}:`, insertError);
              }

              // // Envoyer une notification de mise à jour de statut
              // await telegramService.sendRideStatusUpdateNotification(
              //   updatedRide,
              //   'pending',
              //   'assigned'
              // );

            }
          } catch (error) {
            console.error(`Erreur lors du traitement de la course #${ride.id}:`, error);
          }
        }
      }

      return processedRides;
    } catch (error) {
      console.error('Erreur lors de l\'attribution des courses:', error);
      return [];
    }
  },

  /**
   * Récupère les détails de l'attribution d'une course
   * @param {number} rideId - ID de la course
   * @returns {Promise<Object>} - Données de l'attribution
   */
  getRideAssignmentDetails: async (rideId) => {
    try {
      // Vérifier si la course existe et récupérer ses détails
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (rideError || !ride) {
        console.error(`Course #${rideId} non trouvée:`, rideError);
        return null;
      }

      // Récupérer les intérêts pour cette course
      const { data: interests } = await supabase
        .from('ride_interests')
        .select('*')
        .eq('ride_id', rideId);

      return {
        ...ride,
        is_processed: ride.status !== 'pending', // Une course assignée est considérée comme traitée
        interests: interests || []
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails d'attribution pour la course #${rideId}:`, error);
      return null;
    }
  },

  removeInterest: async (rideId, driverId) => {
    try {
      const { error } = await supabase
        .from('ride_interests')
        .delete()
        .eq('ride_id', rideId)
        .eq('driver_id', driverId);

      return error ? false : true;
    } catch (error) {
      console.error(`Erreur lors du retrait de l'interet pour la course #${rideId} par le chauffeur #${driverId}:`, error);
      return false;
    }
  }


};

export default rideAssignmentService;
