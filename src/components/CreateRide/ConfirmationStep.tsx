// src/components/CreateRide/ConfirmationStep.tsx
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useRides } from '../../contexts/RidesContext';
import { CreateRideData } from '../../types/app';
import dayjs from 'dayjs';
import TestCreateButton from './TestCreateButton';

interface ConfirmationStepProps {
  rideData: {
    isImmediate: boolean;
    date: string;
    time: string;
    pickupLocation: {
      id?: number;
      address: string;
      short_name: string;
      latitude?: number;
      longitude?: number;
    };
    dropoffLocation: {
      id?: number;
      address: string;
      short_name: string;
      latitude?: number;
      longitude?: number;
    };
    clientPhone: string;
    paymentMethod: '100%' | '55%' | 'direct';
  };
  onBack: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  editRideId?: number | null;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  rideData,
  onBack,
  onSuccess,
  editMode = false,
  editRideId = null
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { createRide, updateRide } = useRides();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Créer l'objet de données pour l'API
      const apiData: CreateRideData = {
        userId: '', // Sera remplacé par le contexte
        isImmediate: rideData.isImmediate,
        pickupTime: rideData.time,
        pickupLocation: rideData.pickupLocation,
        dropoffLocation: rideData.dropoffLocation,
        clientPhone: rideData.clientPhone,
        paymentMethod: rideData.paymentMethod
      };

      // Ajouter la date pour les courses planifiées
      if (!rideData.isImmediate) {
        apiData.pickupDate = rideData.date;
      }

      if (editMode && editRideId) {
        // Mettre à jour une course existante
        await updateRide(editRideId, apiData);
      } else {
        // Créer une nouvelle course
        await createRide(apiData);
      }

      onSuccess();
    } catch (error) {
      console.error(`Erreur lors de ${editMode ? 'la modification' : 'la création'} de la course:`, error);
      setError(`Une erreur est survenue lors de ${editMode ? 'la modification' : 'la création'} de la course. Veuillez réessayer.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Formater les données pour l'affichage
  const formatDateTime = () => {
    if (rideData.isImmediate) {
      return `Aujourd'hui à ${rideData.time}`;
    } else {
      return `${dayjs(rideData.date).format('DD/MM/YYYY')} à ${rideData.time}`;
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">
        {editMode ? 'Modification de la course' : 'Confirmation de la course'}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Type de course</div>
          <div className="font-medium">{rideData.isImmediate ? 'Course immédiate' : 'Course planifiée'}</div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Date et heure</div>
          <div className="font-medium">{formatDateTime()}</div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Lieu de départ</div>
          <div className="font-medium">{rideData.pickupLocation.address}</div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Lieu d'arrivée</div>
          <div className="font-medium">{rideData.dropoffLocation.address}</div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Téléphone du client</div>
          <div className="font-medium">{rideData.clientPhone}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Mode de paiement</div>
          <div className="font-medium">
            {rideData.paymentMethod === '100%' ? '100%' :
              rideData.paymentMethod === '55%' ? '55%' :
                'Paiement direct à bord'}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Modifier
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          {editMode ? 'Mettre à jour la course' : 'Confirmer la course'}
        </Button>
      </div>

      {/* Bouton de test - à utiliser uniquement pour le développement */}
      <div className="mt-4">
        <TestCreateButton />
      </div>
    </Card>
  );
};

export default ConfirmationStep;