// src/components/TakeRide/components/RouteDisplay.tsx
import React from 'react';

interface RouteDisplayProps {
  pickupAddress: string;
  dropoffAddress: string;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({
  pickupAddress,
  dropoffAddress
}) => {
  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-4">
      <div className="flex">
        <div className="flex flex-col items-center mr-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="w-0.5 h-20 bg-gray-300 border-dashed border-l-2 my-1"></div>
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
        </div>

        <div className="flex-1">
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-900">Départ</div>
            <div className="text-sm text-gray-700">{pickupAddress}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900">Arrivée</div>
            <div className="text-sm text-gray-700">{dropoffAddress}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDisplay;
