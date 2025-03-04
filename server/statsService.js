// server/statsService.js
/**
 * Service pour la gestion des statistiques
 */
class StatsService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  /**
   * Récupère les statistiques globales du groupe
   */
  async getGroupStats() {
    try {
      // Compter le nombre total de courses
      const { count, error: countError } = await this.supabase
        .from('rides')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Compter les courses par statut
      const { data: ridesData, error: statusError } = await this.supabase
        .from('rides')
        .select('status');

      if (statusError) throw statusError;

      // Initialiser les compteurs à 0
      const statusCounts = {
        pending: 0,
        assigned: 0,
        completed: 0,
        cancelled: 0
      };
      
      // Compter les occurrences de chaque statut
      if (ridesData && ridesData.length > 0) {
        ridesData.forEach(ride => {
          if (ride.status) {
            statusCounts[ride.status] = (statusCounts[ride.status] || 0) + 1;
          }
        });
      }

      return {
        total_rides: count || 0,
        pending_rides: statusCounts.pending || 0,
        assigned_rides: statusCounts.assigned || 0,
        completed_rides: statusCounts.completed || 0,
        cancelled_rides: statusCounts.cancelled || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du groupe:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  async getUserStats(userId) {
    try {
      // Nombre de courses créées par l'utilisateur
      const { count: createdCount, error: createdError } = await this.supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);

      if (createdError) throw createdError;

      // Nombre de courses assignées à l'utilisateur
      const { count: assignedCount, error: assignedError } = await this.supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', userId);

      if (assignedError) throw assignedError;

      return {
        created_rides: createdCount || 0,
        assigned_rides: assignedCount || 0
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des statistiques pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques quotidiennes
   */
  async getDailyStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();

      // Nombre total de courses créées aujourd'hui
      const { count: todayCount, error: todayError } = await this.supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISOString);

      if (todayError) throw todayError;

      // Nombre de courses assignées aujourd'hui
      const { count: assignedCount, error: assignedError } = await this.supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISOString)
        .eq('status', 'assigned');

      if (assignedError) throw assignedError;

      return {
        total_rides_today: todayCount || 0,
        assigned_rides_today: assignedCount || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques quotidiennes:', error);
      throw error;
    }
  }
}

export default (supabase) => new StatsService(supabase);
