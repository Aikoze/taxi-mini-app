// src/components/CreateRide/RideTypeStep.tsx
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { IoCarOutline, IoCalendarOutline } from 'react-icons/io5';

interface RideTypeStepProps {
  isImmediate: boolean;
  onSelectType: (isImmediate: boolean) => void;
  onNext: () => void;
}

const RideTypeStep: React.FC<RideTypeStepProps> = ({ isImmediate, onSelectType, onNext }) => {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Type de course</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          className={`p-4 rounded-lg border-2 ${
            isImmediate 
              ? 'border-telegram-primary bg-telegram-light' 
              : 'border-gray-200 hover:bg-gray-50'
          } transition-colors flex flex-col items-center`}
          onClick={() => onSelectType(true)}
        >
          <IoCarOutline size={36} className="mb-2 text-telegram-primary" />
          <span className="font-medium">Course immédiate</span>
        </button>
        
        <button
          className={`p-4 rounded-lg border-2 ${
            !isImmediate 
              ? 'border-telegram-primary bg-telegram-light' 
              : 'border-gray-200 hover:bg-gray-50'
          } transition-colors flex flex-col items-center`}
          onClick={() => onSelectType(false)}
        >
          <IoCalendarOutline size={36} className="mb-2 text-telegram-primary" />
          <span className="font-medium">Course planifiée</span>
        </button>
      </div>
      
      <Button
        variant="primary"
        fullWidth
        onClick={onNext}
      >
        Continuer
      </Button>
    </Card>
  );
};

export default RideTypeStep;