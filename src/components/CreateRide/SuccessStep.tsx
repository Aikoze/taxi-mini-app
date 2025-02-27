// src/components/CreateRide/SuccessStep.tsx
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

interface SuccessStepProps {
  onCreateNew: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ onCreateNew }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <div className="text-center py-6">
        <IoCheckmarkCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Course créée avec succès !</h2>
        <p className="text-gray-600 mb-6">
          Votre demande a été diffusée aux chauffeurs disponibles.
        </p>
        
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={onCreateNew}
          >
            Créer une nouvelle course
          </Button>
          
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/my-rides')}
          >
            Voir mes courses
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SuccessStep;