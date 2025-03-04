// src/components/common/GoogleMapsAutocomplete.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, XCircle, Star } from 'lucide-react';
import { debounce } from 'lodash';
import { SavedLocation } from '../../types/app';

// Define the structure of a place prediction
interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    main_text_matched_substrings: Array<{ offset: number, length: number }>;
    secondary_text: string;
  };
  types?: string[];
}

// Define the structure of a selected location
interface SelectedLocation {
  address: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  country?: string;
  isSaved?: boolean;
  savedLocationId?: number;
}

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectLocation: (location: SelectedLocation) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  savedLocations?: SavedLocation[];
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsAutocomplete: () => void;
  }
}

const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Entrez une adresse',
  className = '',
  required = false,
  savedLocations = [],
}) => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [savedLocationMatches, setSavedLocationMatches] = useState<SavedLocation[]>([]);
  const [showPredictions, setShowPredictions] = useState<boolean>(false); // Afficher les prédictions par défaut
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [selectedSavedLocationId, setSelectedSavedLocationId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const sessionToken = useRef<any>(null);

  // Effect to initialize saved locations on mount
  useEffect(() => {
    // Initialize saved locations if available
    if (savedLocations && savedLocations.length > 0) {
      setSavedLocationMatches(savedLocations);
    }
  }, [savedLocations]);

  // Load Google Maps script
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps already loaded');
      setScriptLoaded(true);
      return;
    }

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      console.error('Google Maps API key is not defined in environment variables');
      return;
    }

    // Define callback for when the script loads
    window.initGoogleMapsAutocomplete = () => {
      console.log('Google Maps script loaded successfully');
      setScriptLoaded(true);
    };

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      console.log('Google Maps script already exists in DOM');
      setScriptLoaded(true);
      return;
    }

    // Create and append the script tag
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
    script.async = true;
    script.defer = true;

    // Add error handling
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);

    return () => {
      // Only remove if we added it
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.initGoogleMapsAutocomplete;
    };
  }, []);

  // Initialize services after script is loaded
  useEffect(() => {
    if (scriptLoaded && window.google?.maps && window.google.maps.places) {
      try {
        // Create services with proper error handling
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        console.log('Google Maps services initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Maps services:', error);
      }
    }
  }, [scriptLoaded]);

  // Create a debounced function for fetching predictions
  const debouncedFetchPredictions = useCallback(
    debounce((searchValue: string) => {
      if (searchValue.length > 2 && autocompleteService.current && window.google?.maps?.places) {
        setIsLoading(true);
        try {
          autocompleteService.current.getPlacePredictions(
            {
              input: searchValue,
              sessionToken: sessionToken.current,
              // Restrict results to France
              componentRestrictions: { country: 'fr' },
              // Request additional fields for better display
              fields: ['name', 'types', 'formatted_address', 'geometry']
            },
            (predictions: PlacePrediction[] | null, status: string) => {
              setIsLoading(false);
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                console.log('Predictions received:', predictions);
                setPredictions(predictions);
                setShowPredictions(true);
              } else {
                console.warn('No predictions found, status:', status);
                setPredictions([]);
                setShowPredictions(false);
              }
            }
          );
        } catch (error) {
          console.error('Error getting place predictions:', error);
          setIsLoading(false);
          setPredictions([]);
          setShowPredictions(false);
        }
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    }, 300), // 300ms debounce delay
    []
  );

  // Filter saved locations based on search term
  const filterSavedLocations = (searchTerm: string) => {
    if (!savedLocations || savedLocations.length === 0 || searchTerm.length < 2) {
      setSavedLocationMatches([]);
      return;
    }

    const filtered = savedLocations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSavedLocationMatches(filtered);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Only show loading indicator if input is long enough
    if (newValue.length > 2) {
      setIsLoading(true);
    }

    // Filter saved locations
    filterSavedLocations(newValue);

    // Call the debounced function for Google Places
    debouncedFetchPredictions(newValue);
  };

  // Handle saved location selection
  const handleSavedLocationSelect = (location: SavedLocation) => {
    setSelectedSavedLocationId(location.id);
    onSelectLocation({
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      place_id: `saved_${location.id}`,
      isSaved: true,
      savedLocationId: location.id
    });
    onChange(location.address);
    // Ne pas fermer les prédictions pour permettre de voir la sélection
  };

  // Handle place selection
  const handlePlaceSelect = (prediction: PlacePrediction) => {
    if (!placesService.current || !window.google?.maps?.places) {
      console.error('Places service not available');
      // Fallback to manual input
      onSelectLocation({ address: prediction.description });
      onChange(prediction.description);
      setShowPredictions(false);
      return;
    }

    try {
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['formatted_address', 'geometry', 'address_components', 'name', 'types'],
          sessionToken: sessionToken.current,
        },
        (place: any, status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            try {
              // Verify the place is in France
              let isInFrance = false;
              if (place.address_components) {
                isInFrance = place.address_components.some(component =>
                  component.types.includes('country') && component.short_name === 'FR'
                );
              }

              // Format the address to remove ', France' from the end
              let formattedAddress = place.formatted_address.replace(/, France$/, '');

              // If this is an establishment, use its name in the address
              const isEstablishment = place.types?.some(type =>
                ['establishment', 'point_of_interest', 'health', 'doctor', 'hospital', 'pharmacy'].includes(type)
              );

              if (isEstablishment && place.name) {
                formattedAddress = place.name + ', ' + formattedAddress;
              }

              const location = {
                address: formattedAddress,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                place_id: prediction.place_id,
                country: isInFrance ? 'FR' : undefined
              };

              onChange(place.formatted_address);
              onSelectLocation(location);
              setShowPredictions(false);

              // Log if not in France
              if (!isInFrance) {
                console.warn('Selected location is not in France');
              }

              // Get a new session token for the next request
              if (window.google?.maps?.places) {
                sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
              }
            } catch (error) {
              console.error('Error processing place details:', error);
              // Fallback to using the prediction description
              onSelectLocation({ address: prediction.description });
              onChange(prediction.description);
              setShowPredictions(false);
            }
          } else {
            console.warn('Place details not available, status:', status);
            // Fallback to using the prediction description
            onSelectLocation({ address: prediction.description });
            onChange(prediction.description);
            setShowPredictions(false);
          }
        }
      );
    } catch (error) {
      console.error('Error calling getDetails:', error);
      // Fallback to manual input
      onSelectLocation({ address: prediction.description });
      onChange(prediction.description);
      setShowPredictions(false);
    }
  };

  // Handle manual input submission
  const handleManualSubmit = () => {
    if (value.trim().length > 0) {
      onSelectLocation({ address: value.trim() });
      setShowPredictions(false);
    }
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    setPredictions([]);
    setShowPredictions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={() => {
            // Delay hiding predictions to allow for selection
            setTimeout(() => setShowPredictions(false), 200);
          }}
          onFocus={() => {
            setShowPredictions(true);
            // Afficher les adresses enregistrées quand on focus sur le champ
            if (savedLocations.length > 0) {
              setSavedLocationMatches(savedLocations);
            }
          }}
          placeholder={placeholder}
          className={`input pl-10 pr-10 ${className}`}
          required={required}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <XCircle size={18} />
          </button>
        )}
      </div>

      {/* Predictions dropdown - combine saved locations and Google predictions */}
      {showPredictions && (savedLocationMatches.length > 0 || predictions.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Saved locations first */}
          {savedLocationMatches.length > 0 && (
            <div className="border-b border-gray-100 pb-1">
              <div className="px-3 py-1 text-xs text-gray-500 font-medium bg-gray-50">Adresses enregistrées</div>
              {savedLocationMatches.map((location) => {
                const isSelected = selectedSavedLocationId === location.id;
                return (
                  <div
                    key={`saved-${location.id}`}
                    className={`px-4 py-2 cursor-pointer flex flex-col ${isSelected ? 'bg-telegram-light' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSavedLocationSelect(location)}
                  >
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center mr-2 h-5 w-5 rounded-full ${isSelected ? 'bg-telegram-primary text-white' : 'bg-yellow-100 text-yellow-600'} text-xs`}>
                        <Star size={12} />
                      </span>
                      <span className={`font-medium ${isSelected ? 'text-telegram-primary' : ''}`}>{location.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5 ml-7">{location.address}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Google predictions */}
          {predictions.map((prediction) => {
            // Determine if this is a business/establishment
            const isEstablishment = prediction.types?.some(type =>
              ['establishment', 'point_of_interest', 'health', 'doctor', 'hospital', 'pharmacy'].includes(type)
            );

            // Format the prediction for display - remove France from the end
            let mainText = prediction.structured_formatting?.main_text || '';
            let secondaryText = prediction.structured_formatting?.secondary_text || '';

            // Remove ', France' from the end of secondary text
            secondaryText = secondaryText.replace(/, France$/, '');

            return (
              <div
                key={prediction.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                onClick={() => handlePlaceSelect(prediction)}
              >
                <div className="flex items-center">
                  {isEstablishment && (
                    <span className="inline-flex items-center justify-center mr-2 h-5 w-5 rounded-full bg-telegram-light text-telegram-primary text-xs">
                      <MapPin size={12} />
                    </span>
                  )}
                  <span className="font-medium">{mainText}</span>
                </div>
                {secondaryText && (
                  <span className="text-xs text-gray-500 mt-0.5 ml-7">{secondaryText}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No predictions but has input */}
      {/* {value.length > 2 && !isLoading && predictions.length === 0 && showPredictions && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg p-3 text-center">
          <p className="text-sm text-gray-500 mb-2">Aucun résultat trouvé</p>
        </div>
      )} */}
    </div>
  );
};

export default GoogleMapsAutocomplete;
