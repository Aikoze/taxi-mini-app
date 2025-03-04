// src/components/CreateRide/SuccessStep.tsx
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SuccessStepProps {
  onCreateNew: () => void;
  editMode?: boolean;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ onCreateNew, editMode = false }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {editMode ? 'Course modifiée avec succès !' : 'Course créée avec succès !'}
        </h2>
        <p className="text-gray-600 mb-6">
          {editMode
            ? 'Les modifications de votre course ont été enregistrées.'
            : 'Votre demande a été diffusée aux chauffeurs disponibles.'
          }
        </p>

        <div className="space-y-3">
          {!editMode && (
            <Button
              variant="primary"
              fullWidth
              onClick={onCreateNew}
            >
              Créer une nouvelle course
            </Button>
          )}

          <Button
            variant={editMode ? "primary" : "secondary"}
            fullWidth
            onClick={() => navigate('/my-rides')}
          >
            Voir mes courses
          </Button>

          {editMode && (
            <Button
              variant="secondary"
              fullWidth
              onClick={onCreateNew}
            >
              Créer une nouvelle course
            </Button>
          )}
        </div>
      </motion.div>
    </Card>
  );
};

export default SuccessStep;