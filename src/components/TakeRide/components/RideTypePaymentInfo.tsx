// src/components/TakeRide/components/RideTypePaymentInfo.tsx
import React from 'react';
import { IoWallet, IoCarSport, IoCalendarOutline } from 'react-icons/io5';

// Types pour les couleurs des badges
interface ColorScheme {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

interface RideTypePaymentInfoProps {
  isImmediate: boolean;
  paymentMethod: string;
}

const RideTypePaymentInfo: React.FC<RideTypePaymentInfoProps> = ({
  isImmediate,
  paymentMethod
}) => {
  // Déterminer la couleur en fonction du type de course
  const getTypeColor = (): ColorScheme => {
    if (isImmediate) {
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

  // Déterminer la couleur en fonction du mode de paiement
  const getPaymentColor = (): ColorScheme => {
    if (paymentMethod === '100%') {
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-500'
      };
    } else if (paymentMethod === '55%') {
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

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className={`p-2 rounded-lg ${typeColor.bg} border ${typeColor.border}`}>
        <div className="text-xs text-gray-600">Type</div>
        <div className={`text-sm font-medium flex items-center ${typeColor.text}`}>
          {isImmediate ? (
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
          {paymentMethod === '100%' ? '100%' :
            paymentMethod === '55%' ? '55%' : 'Direct'}
        </div>
      </div>
    </div>
  );
};

export default RideTypePaymentInfo;
