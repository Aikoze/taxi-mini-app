// src/pages/RideDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ridesService } from '../api/ridesService';
import MainLayout from '../components/layout/MainLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../contexts/AuthContext';
import RideAssignmentReport from '../components/RideDetail/RideAssignmentReport';
import dayjs from 'dayjs';
import {
  Flag,
  Info,
  ArrowLeft,
  Car
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Ride } from '../types/app';
import { useRides } from '../contexts/RidesContext';
import RideHeader from '../components/RideDetail/RideHeader';
import RideAddresses from '../components/RideDetail/RideAddresses';
import RideDetails from '../components/RideDetail/RideDetails';

const RideDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showInterest } = useRides();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { requestLocation, showAlert, showConfirm } = useTelegram();
  const { user } = useAuth();

  // Utiliser React Query pour récupérer les détails de la course
  const {
    data: ride,
    isLoading,
    error
  } = useQuery({
    queryKey: ['ride', id],
    queryFn: async () => {
      const rideId = id || '0';
      const response = await ridesService.getRideById(rideId);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || 'Course non trouvée');
    },
    onError: (err) => {
      console.error('Erreur lors du chargement de la course:', err);
      showAlert('Course non trouvée');
      navigate('/rides');
    }
  });

  const handleTakeRide = async () => {
    if (!ride) return;

    try {
      setIsSubmitting(true);

      const confirmed = await showConfirm("Êtes-vous sûr de vouloir prendre cette course ?");
      if (!confirmed) {
        setIsSubmitting(false);
        return;
      }

      // Demander la localisation du chauffeur
      const location = await requestLocation();

      if (location) {
        const success = await showInterest(ride.id, location);

        if (success) {
          showAlert('Votre intérêt a été enregistré avec succès !');
          // Rediriger vers la liste des courses disponibles
          navigate('/take-ride');
        } else {
          showAlert('Une erreur est survenue. Veuillez réessayer.');
        }
      } else {
        showAlert('Vous devez partager votre position pour prendre cette course.');
      }
    } catch (error) {
      console.error('Erreur lors de la prise de course:', error);
      showAlert("Une erreur s'est produite lors de la prise de la course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!ride) {
    return (
      <MainLayout title="Détails de la course">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <Info size={48} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Course non trouvée</h2>
          <p className="text-gray-500 mb-6 text-center">Cette course n'existe pas ou n'est plus disponible.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/take-ride')}
            icon={<ArrowLeft size={18} />}
          >
            Retour aux courses disponibles
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Détails de la course"
      showBackButton
      onBackClick={() => navigate('/take-ride')}
    >
      <div className="pb-24">
        {/* Carte principale avec informations essentielles */}
        <Card className="mb-4 border-l-4 border-telegram-primary">
          <div className="p-4">
            {/* En-tête de la course */}
            <RideHeader ride={ride} />

            {/* Indicateur de statut */}
            <div className="mb-4 bg-gray-100 p-2 rounded-lg text-sm flex items-center">
              <Flag size={18} className="mr-2 text-telegram-primary" />
              <span>Statut: <strong>{ride.status === 'pending' ? 'En attente' : ride.status}</strong></span>
            </div>

            {/* Adresses départ/arrivée */}
            <RideAddresses ride={ride} />

            {/* Informations date/heure et autres détails */}
            <RideDetails ride={ride} />
          </div>
        </Card>

        {/* Section informative */}
        <Card className="mb-4 bg-blue-50">
          <div className="p-4">
            <div className="flex items-start">
              <Info className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" size={22} />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Information importante</h3>
                <p className="text-sm text-blue-700">
                  En prenant cette course, vous vous engagez à transporter le client à destination.
                  Assurez-vous d'être disponible et dans une zone proche du lieu de prise en charge.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Rapport d'attribution - s'affiche uniquement pour les courses attribuées ou terminées */}
        {(ride.status === 'assigned' || ride.status === 'completed') && (
          <RideAssignmentReport
            rideId={ride.id}
            userDriverId={user?.telegram_id}
          />
        )}

        {/* Bouton de prise de course - visible uniquement si la course est en attente */}
        {ride.status === 'pending' && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-md"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="primary"
              className="w-full"
              onClick={handleTakeRide}
              isLoading={isSubmitting}
              icon={<Car size={18} />}
            >
              Prendre cette course
            </Button>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default RideDetailPage;