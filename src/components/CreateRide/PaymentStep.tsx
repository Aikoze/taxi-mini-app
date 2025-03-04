// src/components/CreateRide/PaymentStep.tsx
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { BanknoteIcon, CreditCard, Wallet } from 'lucide-react';

interface PaymentStepProps {
  paymentMethod: string;
  onPaymentChange: (method: '100%' | '55%' | 'direct') => void;
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
          className={`w-full p-4 rounded-lg border-2 ${paymentMethod === '100%'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:bg-gray-50'
            } transition-colors flex items-center`}
          onClick={() => onPaymentChange('100%')}
        >
          <CreditCard size={24} className="mr-3 text-green-500" />
          <div className="text-left">
            <div className="font-medium">100%</div>
            <div className="text-sm text-gray-500">Taux de prise en charge complet</div>
          </div>
        </button>

        <button
          className={`w-full p-4 rounded-lg border-2 ${paymentMethod === '55%'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:bg-gray-50'
            } transition-colors flex items-center`}
          onClick={() => onPaymentChange('55%')}
        >
          <Wallet size={24} className="mr-3 text-blue-500" />
          <div className="text-left">
            <div className="font-medium">55% </div>
            <div className="text-sm text-gray-500">Taux de prise en charge partiel</div>
          </div>
        </button>

        <button
          className={`w-full p-4 rounded-lg border-2 ${paymentMethod === 'direct'
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 hover:bg-gray-50'
            } transition-colors flex items-center`}
          onClick={() => onPaymentChange('direct')}
        >
          <BanknoteIcon size={24} className="mr-3 text-amber-500" />
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