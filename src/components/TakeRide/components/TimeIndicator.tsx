// src/components/TakeRide/components/TimeIndicator.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoTime, IoHourglass, IoAlertCircle } from 'react-icons/io5';

interface TimeIndicatorProps {
  isImmediate: boolean;
  isExpired: boolean;
  isUrgent: boolean;
  timeRemaining: string;
}

const TimeIndicator: React.FC<TimeIndicatorProps> = ({
  isImmediate,
  isExpired,
  isUrgent,
  timeRemaining
}) => {
  if (!isImmediate) {
    return (
      <span className="text-sm font-bold flex items-center text-purple-600">
        <IoTime className="mr-1" />
        {timeRemaining}
      </span>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isExpired ? (
        <motion.span
          key="expired"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm font-bold flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full"
        >
          <IoHourglass className="mr-1" />
          Expiré
        </motion.span>
      ) : isUrgent ? (
        <motion.span
          key="urgent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [1, 0.7, 1],
            scale: [1, 1.05, 1],
            backgroundColor: ['#fee2e2', '#fecaca', '#fee2e2']
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5
          }}
          className="text-sm font-bold flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full"
        >
          <IoAlertCircle className="mr-1" />
          {timeRemaining}
        </motion.span>
      ) : (
        <motion.span
          key="normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm font-bold flex items-center text-blue-600"
        >
          <IoTime className="mr-1" />
          {timeRemaining}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default TimeIndicator;
