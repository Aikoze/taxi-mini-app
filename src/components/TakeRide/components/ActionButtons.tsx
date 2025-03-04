// src/components/TakeRide/components/ActionButtons.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../common/Button';
import { IoHourglass, IoInformationCircleOutline } from 'react-icons/io5';
import TestAssignmentButton from '../TestAssignmentButton';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  rideId: number;
  isImmediate: boolean;
  isExpired: boolean;
  isUrgent: boolean;
  timeRemaining: string;
  progressPercentage: number;
  isLoading: boolean;
  handleInterestClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  rideId,
  isImmediate,
  isExpired,
  isUrgent,
  timeRemaining,
  progressPercentage,
  isLoading,
  handleInterestClick
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Bouton pour voir les détails */}
      <div className="relative mb-3 mt-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate(`/ride/${rideId}`)}
          className="mb-2"
        >
          <IoInformationCircleOutline className="mr-2" />
          Voir détails
        </Button>
      </div>

      {/* Bouton d'action avec animation de temps */}
      <div className="relative mt-2">
        {/* Bouton avec animation de temps pour les courses immédiates */}
        {isImmediate && (
          <div className="relative overflow-hidden rounded-lg">
            {/* Barre de progression animée pour le temps restant */}
            {!isExpired && (
              <motion.div
                className={`absolute top-0 bottom-0 right-0 ${isUrgent ? 'bg-red-400' : 'bg-telegram-secondary'} opacity-20 z-0`}
                style={{ width: `${100 - progressPercentage}%` }}
                animate={{
                  width: `${100 - progressPercentage}%`,
                  opacity: isUrgent ? [0.2, 0.4, 0.2] : 0.2
                }}
                transition={{
                  duration: 0.3,
                  opacity: { duration: 0.8, repeat: Infinity }
                }}
              />
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleInterestClick}
              isLoading={isLoading}
              className={`relative z-10 ${isUrgent && !isExpired ? 'animate-pulse' : ''}`}
            >
              {isExpired ? (
                <>
                  <IoHourglass className="mr-2" />
                  Je suis intéressé(e)
                </>
              ) : (
                <>
                  {isUrgent ? (
                    <motion.span
                      className="mr-2 font-bold"
                      animate={{
                        color: ['#ffffff', '#ffcccc', '#ffffff']
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5
                      }}
                    >
                      {timeRemaining}
                    </motion.span>
                  ) : (
                    <span className="mr-2">{timeRemaining}</span>
                  )}
                  Je suis intéressé(e)
                </>
              )}
            </Button>
          </div>
        )}

        {/* Bouton standard pour les courses programmées */}
        {!isImmediate && (
          <div className="space-y-2">
            <Button
              variant="primary"
              fullWidth
              onClick={handleInterestClick}
              isLoading={isLoading}
            >
              Je suis intéressé(e)
            </Button>

            {/* Bouton pour tester l'attribution d'une course (développement uniquement) */}
            <div className="flex justify-end">
              <TestAssignmentButton rideId={rideId} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ActionButtons;
