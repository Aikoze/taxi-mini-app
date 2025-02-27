// src/components/MyRides/RideCard.tsx
import React from 'react';
import { Ride } from '../../types/app';
import Card from '../common/Card';
import Button from '../common/Button';
import dayjs from 'dayjs';
import { IoCall, IoCheckmark, IoTime, IoWarning } from 'react-icons/io5';

interface RideCardProps {
  ride: Ride;
  onCompleteRide?: (rideId: number) => void;
  onCallDriver?: (phone: string) => void;
  isLoading?: boolean;
}

const RideCard: React.FC<RideCardProps> = ({
  ride,
  onCompleteRide,
  onCallDriver,
  isLoading = false
}) => {
  // Obtenir le nom court des lieux s'ils sont disponibles
  const getLocationName = (location: string, savedLocation?: { short_name: string }) => {
    return savedLocation ? savedLocation.short_name : location;
  };
  
  const pickupLocation = getLocationName(ride.pickup_address, ride.pickup_location);
  const dropoffLocation = getLocationName(ride.dropoff_address, ride.dropoff_location);
  
  // Format de la date et heure
  const formatDateTime = (dateString: string) => {
    const date = dayjs(dateString);
    const today = dayjs().startOf('day');
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    
    if (date.isSame(today, 'day')) {
      return `Aujourd'hui à ${date.format('HH:mm')}`;
    } else if (date.isSame(tomorrow, 'day')) {
      return `Demain à ${date.format('HH:mm')}`;
    } else {
      return date.format('DD/MM/YYYY à HH:mm');
    }
  };
  
  // Couleur et texte du statut
  const getStatusInfo = () => {
    switch (ride.status) {
      case 'pending':
        return {
          color: 'bg-yellow-500',
          text: 'En attente'
        };
      case 'assigned':
        return {
          color: 'bg-green-500',
          text: 'Assignée'
        };
      case 'completed':
        return {
          color: 'bg-gray-500',
          text: 'Terminée'
        };
      case 'cancelled':
        return {
          color: 'bg-red-500',
          text: 'Annulée'
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Inconnue'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <Card className={`border-l-4 ${
      ride.status === 'pending' ? 'border-l-yellow-500' :
      ride.status === 'assigned' ? 'border-l-green-500' :
      ride.status === 'completed' ? 'border-l-gray-500' :
      'border-l-red-500'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">
          {pickupLocation} → {dropoffLocation}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full text-white ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>
      
      <div className="text-gray-600 mb-3">
        {formatDateTime(ride.pickup_datetime)}
      </div>
      
      {ride.status === 'assigned' && ride.assigned_driver && (
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="text-sm text-gray-500 mb-1">Chauffeur assigné:</div>
          <div className="font-medium">
            {ride.assigned_driver.first_name} {ride.assigned_driver.last_name}
          </div>
          
          {ride.assigned_driver.phone_number && (
            <div className="mt-2">
              <Button
                variant="primary"
                size="sm"
                icon={<IoCall size={16} />}
                onClick={() => onCallDriver && onCallDriver(ride.assigned_driver!.phone_number)}
              >
                Appeler le chauffeur
              </Button>
            </div>
          )}
        </div>
      )}
      
      {ride.status === 'pending' && (
        <div className="flex items-center text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-3">
          <IoTime className="mr-2" size={20} />
          <span>En attente d'attribution à un chauffeur...</span>
        </div>
      )}
      {ride.status === 'assigned' && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={<IoCheckmark />}
            onClick={() => onCompleteRide && onCompleteRide(ride.id)}
            isLoading={isLoading}
          >
            Marquer comme terminée
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RideCard;