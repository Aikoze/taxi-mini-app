// src/components/TakeRide/AvailableRideCard.tsx
import React, { useState } from 'react';
import { Ride } from '../../types/app';
import Card from '../common/Card';
import Button from '../common/Button';
import dayjs from 'dayjs';
import { IoLocationOutline, IoTime } from 'react-icons/io5';
import { useTelegram } from '../../hooks/useTelegram';

interface AvailableRideCardProps {
  ride: Ride;
  onShowInterest: (rideId: number, location: { latitude: number; longitude: number }) => Promise<void>;
}

const AvailableRideCard: React.FC<AvailableRideCardProps> = ({
  ride,
  onShowInterest
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { requestLocation } = useTelegram();
  
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
  
  // Calcul du temps restant pour les courses immédiates
  const getRemainingTime = () => {
    const createdAt = dayjs(ride.created_at);
    const timeout = ride.is_immediate ? 2 : 30; // minutes
    const expiresAt = createdAt.add(timeout, 'minute');
    const now = dayjs();
    
    if (now.isAfter(expiresAt)) {
      return '0:00';
    }
    
    const diffMinutes = expiresAt.diff(now, 'minute');
    const diffSeconds = expiresAt.diff(now, 'second') % 60;
    
    return `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleInterestClick = async () => {
    try {
      setIsLoading(true);
      const location = await requestLocation();
      
      if (location) {
        await onShowInterest(ride.id, location);
      }
    } catch (error) {
      console.error('Erreur lors de la demande de localisation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">
          {pickupLocation} → {dropoffLocation}
        </h3>
        <span className="text-sm text-telegram-primary font-medium flex items-center">
          <IoTime className="mr-1" />
          {getRemainingTime()}
        </span>
      </div>
      
      <div className="text-gray-600 mb-3">
        {formatDateTime(ride.pickup_datetime)}
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg mb-3">
        <div className="flex items-center text-gray-700 mb-2">
          <IoLocationOutline className="mr-2 text-telegram-primary" size={18} />
          <span>{ride.pickup_address}</span>
        </div>
        
        <div className="text-sm text-gray-500 mt-1">
          Mode de paiement: {ride.payment_method === 'commission' ? 'Taux de prise en charge' : 'Paiement direct à bord'}
        </div>
      </div>
      
      <Button
        variant="primary"
        fullWidth
        onClick={handleInterestClick}
        isLoading={isLoading}
      >
        Je suis intéressé(e)
      </Button>
    </Card>
  );
};

export default AvailableRideCard;