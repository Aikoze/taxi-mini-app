// src/pages/CreateRidePage.tsx
import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import RideTypeStep from '../components/CreateRide/RideTypeStep';
import DateTimeStep from '../components/CreateRide/DateTimeStep';
import LocationStep from '../components/CreateRide/LocationStep';
import PhoneStep from '../components/CreateRide/PhoneStep';
import PaymentStep from '../components/CreateRide/PaymentStep';
import ConfirmationStep from '../components/CreateRide/ConfirmationStep';
import SuccessStep from '../components/CreateRide/SuccessStep';

const CreateRidePage: React.FC = () => {
  // État du formulaire de création
  const [step, setStep] = useState<number>(1);
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
    paymentMethod: '' as 'commission' | 'direct'
  });
  
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
  
  const handlePaymentMethodChange = (method: 'commission' | 'direct') => {
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
      paymentMethod: '' as 'commission' | 'direct'
    });
    setStep(1);
  };
  
  // Rendu selon l'étape actuelle
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <RideTypeStep
            isImmediate={rideData.isImmediate}
            onSelectType={handleRideTypeSelect}
            onNext={() => setStep(2)}
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
          />
        );
      case 8:
        return (
          <SuccessStep
            onCreateNew={resetForm}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <MainLayout title="Création de course">
      {renderStep()}
    </MainLayout>
  );
};

export default CreateRidePage;