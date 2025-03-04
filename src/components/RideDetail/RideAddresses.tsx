// src/components/RideDetail/RideAddresses.tsx
import React from 'react';
import { Ride } from '../../types/app';
import { MapPin } from 'lucide-react';

interface RideAddressesProps {
  ride: Ride;
}

const RideAddresses: React.FC<RideAddressesProps> = ({ ride }) => {
  return (
    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <MapPin className="text-green-600" size={22} />
        </div>
        <div className="ml-3">
          <div className="text-xs text-gray-500 mb-0.5">Prise en charge</div>
          <div className="font-semibold">{ride.pickup_address}</div>
        </div>
      </div>

      <div className="border-l-2 border-dotted border-gray-300 h-6 ml-5"></div>

      <div className="flex items-center">
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <MapPin className="text-red-600" size={22} />
        </div>
        <div className="ml-3">
          <div className="text-xs text-gray-500 mb-0.5">Destination</div>
          <div className="font-semibold">{ride.dropoff_address}</div>
        </div>
      </div>
    </div>
  );
};

export default RideAddresses;