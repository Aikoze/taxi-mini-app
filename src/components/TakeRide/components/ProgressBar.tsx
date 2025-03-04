// src/components/TakeRide/components/ProgressBar.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  timeProgress: number;
  isImmediate: boolean;
  isUrgent: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  timeProgress, 
  isImmediate, 
  isUrgent 
}) => {
  return (
    <div className="h-1 w-full bg-gray-100 -mt-4 mb-3">
      <motion.div
        className={`h-full ${isImmediate ? (isUrgent ? 'bg-red-500' : 'bg-blue-500') : 'bg-purple-500'}`}
        style={{ width: `${100 - timeProgress}%` }}
        animate={{
          width: `${100 - timeProgress}%`,
          backgroundColor: isUrgent ? ['#3b82f6', '#ef4444'] : undefined
        }}
        transition={{
          duration: 0.3,
          backgroundColor: { duration: 0.8, repeat: Infinity, repeatType: "reverse" }
        }}
      />
    </div>
  );
};

export default ProgressBar;
