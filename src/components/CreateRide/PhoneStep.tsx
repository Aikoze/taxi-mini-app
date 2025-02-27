// src/components/CreateRide/PhoneStep.tsx
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

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

  const validatePhone = () => {
    // Regex simplifiée pour valider un numéro de téléphone international
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setError('Format de numéro invalide. Exemple: +33612345678');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleNext = () => {
    if (validatePhone()) {
      onNext();
    }
  };
  
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Numéro de téléphone du client</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone
        </label>
        <input
          type="tel"
          className={`input ${error ? 'border-red-500' : ''}`}
          placeholder="+33 6 12 34 56 78"
          value={phoneNumber}
          onChange={(e) => {
            onPhoneChange(e.target.value);
            if (error) validatePhone();
          }}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
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