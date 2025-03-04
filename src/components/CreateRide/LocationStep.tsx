// src/components/CreateRide/LocationStep.tsx
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { MapPin, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import { useRides } from '../../contexts/RidesContext';
import { useTelegram } from '../../hooks/useTelegram';
import { SavedLocation } from '../../types/app';
import GoogleMapsAutocomplete from '../common/GoogleMapsAutocomplete';

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
  const [searchTerm, setSearchTerm] = useState<string>(selectedLocation.address || '');
  const [filteredLocations, setFilteredLocations] = useState<SavedLocation[]>([]);
  const { savedLocations, fetchSavedLocations } = useRides();
  const { requestLocation } = useTelegram();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSavedLocations, setShowSavedLocations] = useState<boolean>(false);

  useEffect(() => {
    // Charger les emplacements médicaux au montage du composant
    const loadLocations = async () => {
      try {
        await fetchSavedLocations('medical');
      } catch (error) {
        console.error('Erreur lors du chargement des locations:', error);
      }
    };

    loadLocations();
  }, []);

  useEffect(() => {
    // Filtrer les emplacements en fonction du terme de recherche
    const filtered = savedLocations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchTerm, savedLocations]);

  const handleLocationSelect = (location: SavedLocation) => {
    onSelectLocation({
      id: location.id,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude
    });
  };

  const handleManualInput = (address: string) => {
    if (address.trim().length > 5) {
      onSelectLocation({
        address: address.trim()
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

  // Handle location selection from Google Maps autocomplete
  const handleGoogleLocationSelect = (location: {
    address: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    isSaved?: boolean;
    savedLocationId?: number;
  }) => {
    // Si c'est une adresse enregistrée, utiliser son ID et passer à l'étape suivante
    if (location.isSaved && location.savedLocationId) {
      onSelectLocation({
        id: location.savedLocationId,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude
      });
      setSearchTerm(location.address);

      // Passer automatiquement à l'étape suivante après un court délai
      setTimeout(() => {
        onNext();
      }, 300);
      return;
    }

    // Vérifier si l'emplacement est en France
    if (location.country === 'FR' || !location.country) {
      onSelectLocation({
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude
      });
      setSearchTerm(location.address);
    } else {
      // Afficher un message d'erreur si l'emplacement n'est pas en France
      console.warn('Location not in France:', location.address);
      // On accepte quand même l'adresse, mais on pourrait ajouter un message d'avertissement
      onSelectLocation({
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude
      });
      setSearchTerm(location.address);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {isPickup
          ? "Entrez l'adresse de départ"
          : "Entrez l'adresse d'arrivée"}
      </p>

      <div className="mb-4">
        <GoogleMapsAutocomplete
          value={searchTerm}
          onChange={setSearchTerm}
          onSelectLocation={handleGoogleLocationSelect}
          placeholder={isPickup ? "Adresse de départ" : "Adresse d'arrivée"}
          required={true}
          savedLocations={savedLocations}
        />
      </div>

      {/* Saved locations section with toggle */}
      <div className="mb-4">
        {showSavedLocations && (
          <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <button
                  key={location.id}
                  className="w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="font-medium">{location.short_name}</div>
                  <div className="text-sm text-gray-500">{location.address}</div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Aucun lieu enregistré trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual address entry section */}
      {searchTerm.length > 5 && !selectedLocation.address && (
        <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">Vous pouvez utiliser cette adresse :</p>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => handleManualInput(searchTerm)}
          >
            Utiliser "{searchTerm.length > 30 ? searchTerm.substring(0, 30) + '...' : searchTerm}"
          </Button>
        </div>
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