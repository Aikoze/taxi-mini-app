// src/pages/CreateRidePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import RideTypeStep from '../components/CreateRide/RideTypeStep';
import DateTimeStep from '../components/CreateRide/DateTimeStep';
import LocationStep from '../components/CreateRide/LocationStep';
import PhoneStep from '../components/CreateRide/PhoneStep';
import PaymentStep from '../components/CreateRide/PaymentStep';
import ConfirmationStep from '../components/CreateRide/ConfirmationStep';
import SuccessStep from '../components/CreateRide/SuccessStep';
import EditRideForm from '../components/CreateRide/EditRideForm';
import { useRides } from '../contexts/RidesContext';
import { Ride } from '../types/app';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoEllipsisVertical,
  IoPencil,
  IoTime,
  IoCalendar,
  IoRefreshOutline,
  IoChevronForward,
  IoCarOutline,
  IoLocationOutline,
  IoCallOutline,
  IoWalletOutline
} from 'react-icons/io5';
import dayjs from 'dayjs';
import RecentRidesComponent from '../components/MyRides/RecentRidesComponent';
import TestCreateButton from '../components/CreateRide/TestCreateButton';

const CreateRidePage: React.FC = () => {
  const navigate = useNavigate();
  const { myRides, fetchMyRides, isLoading } = useRides();

  // État du formulaire de création
  const [step, setStep] = useState<number>(1);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editRideId, setEditRideId] = useState<number | null>(null);
  const [currentEditRide, setCurrentEditRide] = useState<Ride | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [showRecentRides, setShowRecentRides] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [rideData, setRideData] = useState({
    isImmediate: true,
    date: '',
    time: '',
    pickupLocation: {
      id: undefined,
      address: '',
      latitude: undefined,
      longitude: undefined
    },
    dropoffLocation: {
      id: undefined,
      address: '',
      latitude: undefined,
      longitude: undefined
    },
    clientPhone: '',
    paymentMethod: '' as '100%' | '55%' | 'direct'
  });

  // Récupérer les courses récentes au chargement
  useEffect(() => {
    loadRecentRides();
  }, []);

  // Fonction pour charger les courses récentes
  const loadRecentRides = async () => {
    setRefreshing(true);
    try {
      await fetchMyRides();
      // Filtrer pour n'afficher que les courses récentes (moins de 7 jours)
      const oneWeekAgo = dayjs().subtract(7, 'day');
      const recent = myRides
        .filter(ride => dayjs(ride.created_at).isAfter(oneWeekAgo))
        .sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
        .slice(0, 5); // Limiter à 5 courses récentes

      setRecentRides(recent);
    } catch (error) {
      console.error("Erreur lors du chargement des courses récentes:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handlers pour chaque étape
  const handleRideTypeSelect = (isImmediate: boolean) => {
    setRideData(prev => ({ ...prev, isImmediate }));
  };

  const handleDateChange = (date: string) => {
    setRideData(prev => ({ ...prev, date }));
  };

  const handleTimeChange = (time: string) => {
    setRideData(prev => ({ ...prev, time }));
  };

  const handlePickupLocationSelect = (location: any) => {
    setRideData(prev => ({ ...prev, pickupLocation: location }));
  };

  const handleDropoffLocationSelect = (location: any) => {
    setRideData(prev => ({ ...prev, dropoffLocation: location }));
  };

  const handlePhoneChange = (phone: string) => {
    setRideData(prev => ({ ...prev, clientPhone: phone }));
  };

  const handlePaymentMethodChange = (method: '100%' | '55%' | 'direct') => {
    setRideData(prev => ({ ...prev, paymentMethod: method }));
  };

  const resetForm = () => {
    setRideData({
      isImmediate: true,
      date: '',
      time: '',
      pickupLocation: {
        id: undefined,
        address: '',
        latitude: undefined,
        longitude: undefined
      },
      dropoffLocation: {
        id: undefined,
        address: '',
        latitude: undefined,
        longitude: undefined
      },
      clientPhone: '',
      paymentMethod: '' as '100%' | '55%' | 'direct'
    });
    setStep(1);
    setEditMode(false);
    setEditRideId(null);
    setCurrentEditRide(null);
  };

  // Fonction pour éditer une course existante
  const handleEditRide = (ride: Ride) => {
    setCurrentEditRide(ride);
    setEditMode(true);
    setEditRideId(ride.id);
    setShowRecentRides(false);
  };

  // Rendu selon l'étape actuelle
  const renderStep = () => {
    // Si nous sommes en mode édition, afficher le formulaire d'édition
    if (editMode && currentEditRide) {
      return (
        <EditRideForm
          ride={currentEditRide}
          onSuccess={() => setStep(8)} // Aller à l'étape de succès
          onCancel={() => {
            resetForm();
            setShowRecentRides(true);
          }}
        />
      );
    }

    // Sinon, afficher les étapes normales de création
    switch (step) {
      case 1:
        return (
          <RideTypeStep
            isImmediate={rideData.isImmediate}
            onSelectType={handleRideTypeSelect}
            onNext={() => setStep(2)}
            editMode={editMode}
          />
        );
      case 2:
        return (
          <DateTimeStep
            isImmediate={rideData.isImmediate}
            date={rideData.date}
            time={rideData.time}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <LocationStep
            title="Lieu de départ"
            isPickup={true}
            selectedLocation={rideData.pickupLocation}
            onSelectLocation={handlePickupLocationSelect}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );
      case 4:
        return (
          <LocationStep
            title="Lieu d'arrivée"
            isPickup={false}
            selectedLocation={rideData.dropoffLocation}
            onSelectLocation={handleDropoffLocationSelect}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return (
          <PhoneStep
            phoneNumber={rideData.clientPhone}
            onPhoneChange={handlePhoneChange}
            onNext={() => setStep(6)}
            onBack={() => setStep(4)}
          />
        );
      case 6:
        return (
          <PaymentStep
            paymentMethod={rideData.paymentMethod}
            onPaymentChange={handlePaymentMethodChange}
            onNext={() => setStep(7)}
            onBack={() => setStep(5)}
          />
        );
      case 7:
        return (
          <ConfirmationStep
            rideData={rideData}
            onBack={() => setStep(6)}
            onSuccess={() => setStep(8)}
            editMode={editMode}
            editRideId={editRideId}
          />
        );
      case 8:
        return (
          <SuccessStep
            onCreateNew={resetForm}
            editMode={editMode}
          />
        );
      default:
        return null;
    }
  };

  // Rendu des étapes de navigation
  const renderStepIndicators = () => {
    const steps = [
      { icon: <IoCarOutline />, label: "Type" },
      { icon: <IoCalendar />, label: "Date" },
      { icon: <IoLocationOutline />, label: "Départ" },
      { icon: <IoLocationOutline />, label: "Arrivée" },
      { icon: <IoCallOutline />, label: "Contact" },
      { icon: <IoWalletOutline />, label: "Paiement" },
      { icon: <IoCheckmarkCircle />, label: "Confirmation" }
    ];

    return (
      <div className="mb-6 overflow-x-auto">
        <div className="flex items-center min-w-max">
          {steps.map((stepItem, index) => {
            const isActive = step === index + 1;
            const isCompleted = step > index + 1;

            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div className={`w-8 h-0.5 ${isCompleted ? 'bg-telegram-primary' : 'bg-gray-200'}`} />
                )}
                <div
                  className={`flex flex-col items-center ${isActive ? 'cursor-default' : isCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  onClick={() => isCompleted && setStep(index + 1)}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-1
                    ${isActive ? 'bg-telegram-primary text-white' :
                      isCompleted ? 'text-telegram-primary border border-telegram-primary' :
                        'bg-gray-100 text-gray-400'}
                  `}>
                    {stepItem.icon}
                  </div>
                  <span className="text-xs font-medium">
                    {stepItem.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };


  return (
    <MainLayout
      title={editMode ? "Modifier une course" : "Création de course"}
      showBackButton={true}
      onBackClick={() => {
        if (step > 1 && !editMode) {
          setStep(step - 1);
        } else if (editMode) {
          resetForm();
          setShowRecentRides(true);
        } else {
          navigate(-1);
        }
      }}
    >
      <div className="max-w-md mx-auto ">
        {/* Indicateur de progression - seulement pour la création pas à pas */}
        {!editMode && step < 8 && (
          <>
            {renderStepIndicators()}
            {/* Barre de progression */}
            {/* {renderProgressIndicator()} */}
          </>
        )}

        {/* Étape actuelle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={editMode ? 'edit' : step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Courses récentes */}
        {step === 1 && !editMode && showRecentRides && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <TestCreateButton />

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-lg font-semibold text-gray-800">Vos courses récentes</h2>

            </div>

            {isLoading || refreshing ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-telegram-primary mb-2"
                >
                  <IoRefreshOutline size={30} className="mx-auto" />
                </motion.div>
                <p className="text-gray-500">Chargement des courses...</p>
              </div>
            ) : (
              <RecentRidesComponent recentRides={myRides} handleEditRide={handleEditRide} />
            )}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default CreateRidePage;