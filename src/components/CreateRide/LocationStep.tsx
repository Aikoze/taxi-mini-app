// src/components/CreateRide/LocationStep.tsx
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { IoSearch, IoLocationOutline } from 'react-icons/io5';
import { useRides } from '../../contexts/RidesContext';
import { useTelegram } from '../../hooks/useTelegram';
import { SavedLocation } from '../../types/app';

interface LocationStepProps {
  title: string;
  isPickup: boolean;
  selectedLocation: {
    id?: number;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  onSelectLocation: (location: {
    id?: number;
    address: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  title,
  isPickup,
  selectedLocation,
  onSelectLocation,
  onNext,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredLocations, setFilteredLocations] = useState<SavedLocation[]>([]);
  const { savedLocations, fetchSavedLocations } = useRides();
  const { requestLocation } = useTelegram();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Charger les emplacements médicaux au montage du composant
    const loadLocations = async () => {
      await fetchSavedLocations('medical');
    };
    
    loadLocations();
  }, [fetchSavedLocations]);
  
  useEffect(() => {
    // Filtrer les emplacements en fonction du terme de recherche
    if (searchTerm.trim() === '') {
      setFilteredLocations(savedLocations);
    } else {
      const filtered = savedLocations.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm, savedLocations]);
  
  const handleLocationSelect = (location: SavedLocation) => {
    onSelectLocation({
      id: location.id,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude
    });
  };
  
  const handleManualInput = () => {
    if (searchTerm.trim().length > 5) {
      onSelectLocation({
        address: searchTerm
      });
    }
  };
  
  const handleShareLocation = async () => {
    try {
      setIsLoading(true);
      const location = await requestLocation();
      
      if (location) {
        onSelectLocation({
          address: `${location.latitude}, ${location.longitude}`,
          latitude: location.latitude,
          longitude: location.longitude
        });
      }
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="Rechercher un lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredLocations.length > 0 ? (
        <div className="mb-4 max-h-60 overflow-y-auto rounded-lg border border-gray-200">
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
              onClick={() => handleLocationSelect(location)}
            >
              <div className="font-medium">{location.short_name}</div>
              <div className="text-sm text-gray-500">{location.address}</div>
            </button>
          ))}
        </div>
      ) : searchTerm.length > 0 ? (
        <div className="mb-4 p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
          <p>Aucun lieu trouvé. Vous pouvez saisir une adresse personnalisée.</p>
          <Button 
            className="mt-2" 
            variant="secondary"
            onClick={handleManualInput}
          >
            Utiliser "{searchTerm}"
          </Button>
        </div>
      ) : (
        <div className="mb-4 p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
          <p>Veuillez rechercher un lieu ou choisir parmi les options ci-dessous.</p>
        </div>
      )}
      
      {isPickup && (
        <Button
          variant="secondary"
          icon={<IoLocationOutline />}
          fullWidth
          className="mb-4"
          onClick={handleShareLocation}
          isLoading={isLoading}
        >
          Partager ma position
        </Button>
      )}
      
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Retour
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onNext}
          disabled={!selectedLocation.address}
        >
          Continuer
        </Button>
      </div>
    </Card>
  );
};

export default LocationStep;