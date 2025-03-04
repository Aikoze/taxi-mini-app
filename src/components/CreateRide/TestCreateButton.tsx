import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useRides } from '../../contexts/RidesContext';
import { CreateRideData } from '../../types/app';

const TestCreateButton: React.FC = () => {
  const { createRide } = useRides();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateTestRide = async () => {
    if (!user) return;

    // Obtenir la date et l'heure actuelles
    const now = dayjs();
    const pickupTime = now.format('HH:mm');

    // Créer une course immédiate avec des données prédéfinies
    const rideData: CreateRideData = {
      userId: user.telegram_id.toString(),
      isImmediate: true,
      pickupTime: pickupTime,
      pickupLocation: {
        address: 'Gare de Vannes',
        latitude: 47.6572,
        longitude: -2.7572
      },
      dropoffLocation: {
        address: 'Aéroport de Nantes',
        latitude: 47.1603,
        longitude: -1.6111
      },
      clientPhone: '+33612345678',
      paymentMethod: '100%'
    };

    try {
      const createdRide = await createRide(rideData);
      console.log('Course créée avec succès:', createdRide);

      // Rediriger vers la page des courses
      navigate('/my-rides');
    } catch (error) {
      console.error('Erreur lors de la création de la course test:', error);
    }
  };

  return (
    <Button
      onClick={handleCreateTestRide}
      variant="primary"
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
    >
      <Sparkles size={18} />
      Créer une course test immédiate
    </Button>
  );
};

export default TestCreateButton;
