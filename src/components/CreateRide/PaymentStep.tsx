// src/components/CreateRide/PaymentStep.tsx
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { IoCash, IoCard } from 'react-icons/io5';

interface PaymentStepProps {
  paymentMethod: string;
  onPaymentChange: (method: 'commission' | 'direct') => void;
  onNext: () => void;
  onBack: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethod,
  onPaymentChange,
  onNext,
  onBack
}) => {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Mode de paiement</h2>
      
      <div className="mb-6 space-y-3">
        <button
          className={`w-full p-4 rounded-lg border-2 ${
            paymentMethod === 'commission' 
              ? 'border-telegram-primary bg-telegram-light' 
              : 'border-gray-200 hover:bg-gray-50'
          } transition-colors flex items-center`}
          onClick={() => onPaymentChange('commission')}
        >
          <IoCard size={24} className="mr-3 text-telegram-primary" />
          <div className="text-left">
            <div className="font-medium">Taux de prise en charge</div>
            <div className="text-sm text-gray-500">Le paiement est géré par le système</div>
          </div>
        </button>
        
        <button
          className={`w-full p-4 rounded-lg border-2 ${
            paymentMethod === 'direct' 
              ? 'border-telegram-primary bg-telegram-light' 
              : 'border-gray-200 hover:bg-gray-50'
          } transition-colors flex items-center`}
          onClick={() => onPaymentChange('direct')}
        >
          <IoCash size={24} className="mr-3 text-telegram-primary" />
          <div className="text-left">
            <div className="font-medium">Paiement direct à bord</div>
            <div className="text-sm text-gray-500">Le client paie directement au chauffeur</div>
          </div>
        </button>
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
          onClick={onNext}
          disabled={!paymentMethod}
        >
          Continuer
        </Button>
      </div>
    </Card>
  );
};

export default PaymentStep;