// src/components/TakeRide/components/RideStatusBadges.tsx
import React from 'react';
import { IoCarSport, IoCalendarOutline, IoWallet } from 'react-icons/io5';

interface RideStatusBadgesProps {
  isImmediate: boolean;
  paymentMethod: string;
}

const RideStatusBadges: React.FC<RideStatusBadgesProps> = ({
  isImmediate,
  paymentMethod
}) => {
  // Déterminer la couleur en fonction du type de course
  const getTypeColor = () => {
    if (isImmediate) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700'
      };
    } else {
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700'
      };
    }
  };

  // Déterminer la couleur en fonction du mode de paiement
  const getPaymentColor = () => {
    if (paymentMethod === '100%') {
      return {
        bg: 'bg-green-50',
        text: 'text-green-700'
      };
    } else if (paymentMethod === '55%') {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700'
      };
    } else {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700'
      };
    }
  };

  const typeColor = getTypeColor();
  const paymentColor = getPaymentColor();

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${typeColor.bg} ${typeColor.text}`}>
        {isImmediate ? (
          <>
            <IoCarSport className="mr-1" />
            Immédiat
          </>
        ) : (
          <>
            <IoCalendarOutline className="mr-1" />
            Programmé
          </>
        )}
      </span>

      <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${paymentColor.bg} ${paymentColor.text}`}>
        <IoWallet className="mr-1" />
        {paymentMethod === '100%' ? '100%' :
          paymentMethod === '55%' ? '55%' : 'Direct'}
      </span>
    </div>
  );
};

export default RideStatusBadges;
