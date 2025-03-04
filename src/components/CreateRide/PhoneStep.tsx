// src/components/CreateRide/PhoneStep.tsx
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Phone, AlertTriangle, InfoIcon } from 'lucide-react';

interface PhoneStepProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PhoneStep: React.FC<PhoneStepProps> = ({
  phoneNumber,
  onPhoneChange,
  onNext,
  onBack
}) => {
  const [error, setError] = useState<string | null>(null);
  const [formattedNumber, setFormattedNumber] = useState<string>(phoneNumber);
  
  // Format the phone number on component mount
  useEffect(() => {
    if (phoneNumber) {
      formatPhoneNumber(phoneNumber);
    }
  }, []);

  // Format phone number for display while preserving the raw value for validation
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except the plus sign at the beginning
    let digitsOnly = value.replace(/[^\d+]/g, '');
    
    // Ensure only one plus sign at the beginning
    if (digitsOnly.startsWith('+')) {
      digitsOnly = '+' + digitsOnly.substring(1).replace(/\+/g, '');
    } else {
      digitsOnly = digitsOnly.replace(/\+/g, '');
    }
    
    // Format the number with spaces for better readability
    let formatted = '';
    
    if (digitsOnly.startsWith('+')) {
      // International format: +XX XXX XXX XXX
      const countryCode = digitsOnly.substring(0, 3); // +XX
      const rest = digitsOnly.substring(3);
      
      formatted = countryCode;
      
      // Add spaces every 3 digits for the rest
      for (let i = 0; i < rest.length; i += 3) {
        const chunk = rest.substring(i, Math.min(i + 3, rest.length));
        formatted += ' ' + chunk;
      }
    } else {
      // National format: XX XX XX XX XX (for France)
      for (let i = 0; i < digitsOnly.length; i += 2) {
        if (i > 0) formatted += ' ';
        formatted += digitsOnly.substring(i, Math.min(i + 2, digitsOnly.length));
      }
    }
    
    setFormattedNumber(formatted);
    
    // Pass the raw digits to the parent component
    onPhoneChange(digitsOnly);
    
    return digitsOnly;
  };
  
  const validatePhone = () => {
    // Get the raw digits for validation
    const rawNumber = phoneNumber.replace(/\s/g, '');
    
    // Check if the number is empty
    if (!rawNumber) {
      setError('Veuillez saisir un numéro de téléphone');
      return false;
    }
    
    // Check if the number has a valid format
    // International format: +XXXXXXXXXXX (10-15 digits)
    // National format: XXXXXXXXXX (10 digits for France)
    const intlRegex = /^\+[0-9]{10,15}$/;
    const nationalRegex = /^0[0-9]{9}$/; // French format starting with 0
    
    if (!intlRegex.test(rawNumber) && !nationalRegex.test(rawNumber)) {
      setError('Format de numéro invalide. Exemples: +33612345678 ou 0612345678');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    formatPhoneNumber(value);
    
    // Clear error when user types
    if (error) setError(null);
  };
  
  const handleNext = () => {
    if (validatePhone()) {
      onNext();
    }
  };
  
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Numéro de téléphone du client</h2>
      <p className="text-sm text-gray-500 mb-4">Saisissez le numéro de téléphone du client qui sera pris en charge</p>
      
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="text-gray-400" />
          </div>
          <input
            type="tel"
            className={`input pl-10 ${error ? 'border-red-500' : ''}`}
            placeholder="+33 6 12 34 56 78"
            value={formattedNumber}
            onChange={handleInputChange}
            autoComplete="tel"
          />
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <AlertTriangle className="mr-1" /> {error}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <InfoIcon className="mr-1" /> 
            Formats acceptés: +33612345678 ou 0612345678
          </p>
        )}
      </div>
      
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
          onClick={handleNext}
          disabled={!phoneNumber}
        >
          Continuer
        </Button>
      </div>
    </Card>
  );
};

export default PhoneStep;