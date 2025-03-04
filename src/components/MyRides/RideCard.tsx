// src/components/MyRides/RideCard.tsx
import React from 'react';
import { Ride } from '../../types/app';
import Card from '../common/Card';
import Button from '../common/Button';
import dayjs from 'dayjs';
import {
  IoCheckmark,
  IoTime,
  IoWarning,
  IoCalendarOutline,
  IoCarOutline,
  IoCarSport,
  IoWallet
} from 'react-icons/io5';

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

  // Déterminer la couleur en fonction du type de course
  const getTypeColor = () => {
    if (ride.is_immediate) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'text-blue-500'
      };
    } else {
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: 'text-purple-500'
      };
    }
  };

  const getPaymentColor = () => {
    if (ride.payment_method === '100%') {
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-500'
      };
    } else if (ride.payment_method === '55%') {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'text-blue-500'
      };
    } else {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: 'text-amber-500'
      };
    }
  };

  const typeColor = getTypeColor();
  const paymentColor = getPaymentColor();
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
          textColor: 'text-yellow-800',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          icon: <IoTime className="mr-2" size={18} />,
          text: 'En attente'
        };
      case 'assigned':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          icon: <IoCarOutline className="mr-2" size={18} />,
          text: 'Assignée'
        };
      case 'completed':
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-800',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          icon: <IoCheckmark className="mr-2" size={18} />,
          text: 'Terminée'
        };
      case 'cancelled':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          icon: <IoWarning className="mr-2" size={18} />,
          text: 'Annulée'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-800',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          icon: null,
          text: 'Inconnue'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`border-l-4 ${statusInfo.borderColor} hover:shadow-lg transition-shadow duration-200`}>
      {/* En-tête de la carte */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.textColor} ${statusInfo.bgColor} flex items-center`}>
            {statusInfo.icon}
            {statusInfo.text}
          </span>
          {ride.is_immediate && (
            <span className="ml-2 px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-800">
              Immédiat
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Créée le {dayjs(ride.created_at).format('DD/MM/YYYY')}
        </div>
      </div>

      {/* Titre et date */}
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-1">
          {pickupLocation} → {dropoffLocation}
        </h3>
        <div className="text-sm text-gray-600 flex items-center">
          <IoCalendarOutline className="mr-1" />
          {formatDateTime(ride.pickup_datetime)}
        </div>
      </div>

      {/* Trajet */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex">
          <div className="flex flex-col items-center mr-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-0.5 h-20 bg-gray-300 border-dashed border-l-2 my-1"></div>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>

          <div className="flex flex-col">
            <div className="mb-2">
              <div className="text-sm font-medium text-gray-900">Départ</div>
              <div className="text-sm text-gray-700">{ride.pickup_address}</div>
            </div>

            <div className='mt-auto'>
              <div className="text-sm font-medium text-gray-900">Arrivée</div>
              <div className="text-sm text-gray-700">{ride.dropoff_address}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Informations complémentaires */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={`p-2 rounded-lg ${typeColor.bg} border ${typeColor.border}`}>
          <div className="text-xs text-gray-600">Type</div>
          <div className={`text-sm font-medium flex items-center ${typeColor.text}`}>
            {ride.is_immediate ? (
              <>
                <IoCarSport className={`mr-1 ${typeColor.icon}`} />
                Course immédiate
              </>
            ) : (
              <>
                <IoCalendarOutline className={`mr-1 ${typeColor.icon}`} />
                Course programmée
              </>
            )}
          </div>
        </div>

        <div className={`p-2 rounded-lg ${paymentColor.bg} border ${paymentColor.border}`}>
          <div className="text-xs text-gray-600">Paiement</div>
          <div className={`text-sm font-medium flex items-center ${paymentColor.text}`}>
            <IoWallet className={`mr-1 ${paymentColor.icon}`} />
            {ride.payment_method === '100%' ? '100%' :
              ride.payment_method === '55%' ? '55%' : 'Direct'}
          </div>
        </div>
      </div>

      {/* Message d'attente */}
      {ride.status === 'pending' && (
        <div className="flex items-center text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-3">
          <IoTime className="mr-2" size={20} />
          <span>En attente d'attribution à un chauffeur...</span>
        </div>
      )}

    </Card>
  );
};

export default RideCard;