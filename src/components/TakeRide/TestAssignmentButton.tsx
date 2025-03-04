import React, { useState } from 'react';
import Button from '../common/Button';
import { BoltIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRides } from '../../contexts/RidesContext';
import { useTelegram } from '../../hooks/useTelegram';

interface TestAssignmentButtonProps {
  rideId: number;
}

const TestAssignmentButton: React.FC<TestAssignmentButtonProps> = ({ rideId }) => {
  const { user } = useAuth();
  const { fetchAvailableRides } = useRides();
  const { showAlert } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulateAssignment = async () => {
    if (!user || !rideId) return;

    setIsLoading(true);
    try {
      // Effectuer une requête API pour simuler l'attribution de la course
      const response = await fetch('/api/rides/simulate-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rideId,
          driverId: user.telegram_id.toString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Attribution de course simulée avec succès');
        // Rafraîchir les courses disponibles
        fetchAvailableRides();
      } else {
        showAlert('Erreur lors de la simulation d\'attribution');
      }
    } catch (error) {
      console.error('Erreur lors de la simulation d\'attribution:', error);
      showAlert('Erreur lors de la simulation d\'attribution');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleSimulateAssignment}
      isLoading={isLoading}
      className="bg-amber-500 hover:bg-amber-600 text-white p-1 rounded-md flex items-center gap-1 text-xs"
    >
      <BoltIcon size={12} />
      Tester Attribution
    </Button>
  );
};

export default TestAssignmentButton;
