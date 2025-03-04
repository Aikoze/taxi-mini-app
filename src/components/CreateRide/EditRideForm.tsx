// src/components/CreateRide/EditRideForm.tsx
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useRides } from '../../contexts/RidesContext';
import { Ride, CreateRideData } from '../../types/app';
import dayjs from 'dayjs';
import { Calendar, Clock, MapPin, Phone, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditRideFormProps {
  ride: Ride;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditRideForm: React.FC<EditRideFormProps> = ({ ride, onSuccess, onCancel }) => {
  const { updateRide, isLoading } = useRides();
  const [error, setError] = useState<string | null>(null);
  
  // Initialiser les données du formulaire avec les valeurs de la course
  const pickupDateTime = dayjs(ride.pickup_datetime);
  const [formData, setFormData] = useState({
    isImmediate: ride.is_immediate,
    date: pickupDateTime.format('YYYY-MM-DD'),
    time: pickupDateTime.format('HH:mm'),
    pickupAddress: ride.pickup_address,
    dropoffAddress: ride.dropoff_address,
    clientPhone: ride.client_phone,
    paymentMethod: ride.payment_method as '100%' | '55%' | 'direct'
  });
  
  // Gérer les changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer le changement de type de course (immédiate ou planifiée)
  const handleImmediateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isImmediate: e.target.value === 'true'
    }));
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Créer l'objet de données pour l'API
      const apiData: CreateRideData = {
        userId: '', // Sera remplacé par le contexte
        isImmediate: formData.isImmediate,
        pickupTime: formData.time,
        pickupLocation: {
          id: ride.pickup_location_id,
          address: formData.pickupAddress,
          latitude: ride.pickup_lat || undefined,
          longitude: ride.pickup_lng || undefined
        },
        dropoffLocation: {
          id: ride.dropoff_location_id,
          address: formData.dropoffAddress,
          latitude: undefined,
          longitude: undefined
        },
        clientPhone: formData.clientPhone,
        paymentMethod: formData.paymentMethod
      };
      
      // Ajouter la date pour les courses planifiées
      if (!formData.isImmediate) {
        apiData.pickupDate = formData.date;
      }
      
      await updateRide(ride.id, apiData);
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la modification de la course:', error);
      setError('Une erreur est survenue lors de la modification de la course. Veuillez réessayer.');
    }
  };
  
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Modifier la course</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type de course */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Calendar className="mr-2" />
              Type de course
            </div>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isImmediate"
                  value="true"
                  checked={formData.isImmediate}
                  onChange={handleImmediateChange}
                  className="form-radio h-4 w-4 text-telegram-primary focus:ring-telegram-primary"
                />
                <span className="ml-2">Immédiate</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isImmediate"
                  value="false"
                  checked={!formData.isImmediate}
                  onChange={handleImmediateChange}
                  className="form-radio h-4 w-4 text-telegram-primary focus:ring-telegram-primary"
                />
                <span className="ml-2">Planifiée</span>
              </label>
            </div>
          </label>
        </div>
        
        {/* Date et heure */}
        {!formData.isImmediate && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center mb-1">
                <Calendar className="mr-2" />
                Date
              </div>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-telegram-primary focus:outline-none focus:ring-1 focus:ring-telegram-primary"
                required
              />
            </label>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Clock className="mr-2" />
              Heure
            </div>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-telegram-primary focus:outline-none focus:ring-1 focus:ring-telegram-primary"
              required
            />
          </label>
        </div>
        
        {/* Adresses */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <MapPin className="mr-2" />
              Lieu de départ
            </div>
            <input
              type="text"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-telegram-primary focus:outline-none focus:ring-1 focus:ring-telegram-primary"
              required
            />
          </label>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <MapPin className="mr-2" />
              Lieu d'arrivée
            </div>
            <input
              type="text"
              name="dropoffAddress"
              value={formData.dropoffAddress}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-telegram-primary focus:outline-none focus:ring-1 focus:ring-telegram-primary"
              required
            />
          </label>
        </div>
        
        {/* Téléphone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Phone className="mr-2" />
              Téléphone du client
            </div>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-telegram-primary focus:outline-none focus:ring-1 focus:ring-telegram-primary"
              required
            />
          </label>
        </div>
        
        {/* Mode de paiement */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Wallet className="mr-2" />
              Mode de paiement
            </div>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-telegram-primary focus:outline-none focus:ring-1 focus:ring-telegram-primary"
              required
            >
              <option value="100%">100%</option>
              <option value="55%">55% </option>
              <option value="direct">Paiement direct</option>
            </select>
          </label>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onCancel}
            type="button"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            fullWidth
            type="submit"
            isLoading={isLoading}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EditRideForm;
