// src/components/RideDetail/RideDetails.tsx
import React from 'react';
import dayjs from 'dayjs';
import { Clock, Calendar, Wallet, Phone } from 'lucide-react';
import { Ride } from '../../types/app';

interface RideDetailsProps {
    ride: Ride;
}

const RideDetails: React.FC<RideDetailsProps> = ({ ride }) => {
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

    return (
        <div className="space-y-3 mt-4">
            <div className="flex items-center">
                {ride.is_immediate ? (
                    <Clock className="text-telegram-primary mr-3" size={20} />
                ) : (
                    <Calendar className="text-telegram-primary mr-3" size={20} />
                )}
                <div>
                    <div className="text-sm text-gray-500">Date et heure</div>
                    <div className="font-medium">{formatDateTime(ride.pickup_datetime)}</div>
                </div>
            </div>

            <div className="flex items-center">
                <Wallet className="text-telegram-primary mr-3" size={20} />
                <div>
                    <div className="text-sm text-gray-500">Méthode de paiement</div>
                    <div className="font-medium">
                        {ride.payment_method}
                    </div>
                </div>
            </div>

            {ride.client_phone && (
                <div className="flex items-center">
                    <Phone className="text-telegram-primary mr-3" size={20} />
                    <div>
                        <div className="text-sm text-gray-500">Contact client</div>
                        <div className="font-medium">{ride.client_phone}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RideDetails;