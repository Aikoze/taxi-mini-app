// src/components/RideDetail/RideAssignmentReport.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../common/Card';
import { Award, Target, User, Clock, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import { ridesService } from '../../api/ridesService';

interface RideAssignmentReportProps {
  rideId: string;
  userDriverId?: string;
}

interface DriverRanking {
  driver_id: string;
  driver_name: string;
  distance: number;
  duration: number;
  rank: number;
  is_assigned: boolean;
}

const RideAssignmentReport: React.FC<RideAssignmentReportProps> = ({ rideId, userDriverId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['rideAssignment', rideId],
    queryFn: async () => {
      const response = await ridesService.getRideAssignment(parseInt(rideId));
      console.log('response', response);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Impossible de charger le rapport d\'attribution');
    }
  });

  if (isLoading || !data) {
    return (
      <Card className="mb-4 animate-pulse">
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  const { assigned_driver, driver_rankings } = data;

  return (
    <Card className="mb-4">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-3 flex items-center">
          <Award className="text-telegram-primary mr-2" size={20} />
          Rapport d'attribution
        </h3>

        {assigned_driver && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="font-semibold text-green-800 mb-1 flex items-center">
              <User className="mr-2 text-green-700" size={18} />
              Course attribuée à {assigned_driver.driver_name}
            </div>
            <div className="text-sm text-green-700 mb-1 flex items-center">
              <Clock className="mr-2" size={16} />
              Le {dayjs(assigned_driver.assigned_at).format('DD/MM à HH:mm')}
            </div>
            <div className="text-sm text-green-700 flex items-center">
              <MapPin className="mr-2" size={16} />
              Distance: {(assigned_driver.distance / 1000).toFixed(1)} km ({Math.round(assigned_driver.duration / 60)} min)
            </div>
          </div>
        )}

        <h4 className="font-medium text-sm uppercase text-gray-500 mb-2 flex items-center">
          <Target className="mr-1 text-gray-400" size={16} />
          Classement des chauffeurs
        </h4>

        <div className="space-y-2">
          {driver_rankings?.map((driver: DriverRanking) => (
            <div
              key={driver.driver_id}
              className={`p-2 rounded-lg border flex items-center justify-between ${driver.driver_id === userDriverId
                ? 'bg-blue-50 border-blue-200'
                : driver.is_assigned
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${driver.rank === 1
                  ? 'bg-yellow-400 text-yellow-800'
                  : driver.rank === 2
                    ? 'bg-gray-300 text-gray-700'
                    : driver.rank === 3
                      ? 'bg-amber-600 text-amber-100'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                  {driver.rank}
                </div>
                <div>
                  <div className="font-medium">{driver.driver_name}</div>
                  <div className="text-xs text-gray-500">
                    {(driver.distance / 1000).toFixed(1)} km | {Math.round(driver.duration / 60)} min
                  </div>
                </div>
              </div>
              {driver.driver_id === userDriverId && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Vous</span>
              )}
              {driver.is_assigned && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Assigné</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RideAssignmentReport;