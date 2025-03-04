import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ride } from '../../types/app';
import { Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RideAssignmentAlertProps {
  ride: Ride;
  isAssigned: boolean;
  onClose: () => void;
  visible: boolean;
}

const RideAssignmentAlert: React.FC<RideAssignmentAlertProps> = ({
  ride,
  isAssigned,
  onClose,
  visible
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/ride/${ride.id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4"
        >
          <div className={`max-w-md w-full rounded-lg shadow-xl overflow-hidden ${isAssigned ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500' :
              'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500'
            }`}>
            <div className="p-5">
              <div className="flex items-start">
                {isAssigned ? (
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                  </div>
                )}

                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <h3 className="text-lg font-medium text-gray-900">
                    {isAssigned ? 'Course attribuée !' : 'Course attribuée à un autre chauffeur'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isAssigned
                      ? `La course de ${ride.pickup_address} à ${ride.dropoff_address} vous a été attribuée.`
                      : `La course de ${ride.pickup_address} à ${ride.dropoff_address} a été attribuée à un autre chauffeur.`
                    }
                  </p>

                  <div className="mt-4 flex">
                    <button
                      onClick={handleViewDetails}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isAssigned ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 ${isAssigned ? 'focus:ring-green-500' : 'focus:ring-blue-500'
                        }`}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Voir les détails
                    </button>
                    <button
                      onClick={onClose}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Fermer
                    </button>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fermer</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RideAssignmentAlert;
