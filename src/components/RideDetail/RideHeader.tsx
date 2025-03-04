// src/components/RideDetail/RideHeader.tsx
import React from 'react';
import dayjs from 'dayjs';
import { Ride } from '../../types/app';

interface RideHeaderProps {
    ride: Ride;
}

const RideHeader: React.FC<RideHeaderProps> = ({ ride }) => {
    return (
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-lg font-bold">Course #{ride.id}</h2>
                <p className="text-gray-500 text-sm">
                    Créée {dayjs(ride.created_at).format('DD/MM à HH:mm')}
                </p>
            </div>
            <div className="bg-telegram-primary text-white text-sm px-3 py-1 rounded-full">
                {ride.is_immediate ? 'Immédiate' : 'Programmée'}
            </div>
        </div>
    );
};

export default RideHeader;