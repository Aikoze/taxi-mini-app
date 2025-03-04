// src/components/TakeRide/InterestedRidesBar.tsx
import React from 'react';
import { Ride } from '../../types/app';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { MapPin, Clock, Wallet, Car, Calendar, X } from 'lucide-react';

interface InterestedRidesBarProps {
  rides: Ride[];
  onRemoveInterest: (rideId: number) => void;
  className?: string;
}

const InterestedRidesBar: React.FC<InterestedRidesBarProps> = ({
  rides,
  onRemoveInterest,
  className = ''
}) => {
  if (rides.length === 0) return null;

  // Format de la date et heure (version courte)
  const formatDateTime = (dateString: string) => {
    const date = dayjs(dateString);
    return date.format('HH:mm');
  };

  // Obtenir le nom court des lieux s'ils sont disponibles
  const getLocationName = (location: string, savedLocation?: { short_name: string }) => {
    return savedLocation ? savedLocation.short_name : location.split(',')[0];
  };

  return (
    <div className={`mb-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Vos intérêts ({rides.length})
      </h3>
      
      <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2">
        {rides.map(ride => {
          const pickupLocation = getLocationName(ride.pickup_address, ride.pickup_location);
          const dropoffLocation = getLocationName(ride.dropoff_address, ride.dropoff_location);
          
          return (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-sm p-3 relative"
            >
              {/* Bouton pour retirer l'intérêt */}
              <button 
                onClick={() => onRemoveInterest(ride.id)}
                className="absolute top-1 right-1 p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                aria-label="Retirer mon intérêt"
              >
                <X size={14} className="text-gray-500" />
              </button>
              
              {/* Badge de type et paiement */}
              <div className="flex gap-1 mb-2">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center ${
                  ride.is_immediate ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                }`}>
                  {ride.is_immediate ? <Car size={10} className="mr-0.5" /> : <Calendar size={10} className="mr-0.5" />}
                  {ride.is_immediate ? 'Imm.' : 'Prog.'}
                </span>
                
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center ${
                  ride.payment_method === '100%' ? 'bg-green-50 text-green-700' : 
                  ride.payment_method === '55%' ? 'bg-blue-50 text-blue-700' : 
                  'bg-amber-50 text-amber-700'
                }`}>
                  <Wallet size={10} className="mr-0.5" />
                  {ride.payment_method}
                </span>
              </div>
              
              {/* Lieux */}
              <div className="text-xs font-medium mb-1 flex items-center">
                <MapPin size={12} className="text-blue-500 mr-1 flex-shrink-0" />
                <span className="truncate">{pickupLocation}</span>
              </div>
              
              <div className="text-xs font-medium mb-2 flex items-center">
                <MapPin size={12} className="text-red-500 mr-1 flex-shrink-0" />
                <span className="truncate">{dropoffLocation}</span>
              </div>
              
              {/* Heure */}
              <div className="text-xs text-gray-500 flex items-center">
                <Clock size={12} className="mr-1" />
                {formatDateTime(ride.pickup_datetime)}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Style pour masquer la scrollbar mais garder la fonction de défilement */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default InterestedRidesBar;
