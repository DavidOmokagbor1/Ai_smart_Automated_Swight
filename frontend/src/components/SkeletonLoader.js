import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, className = '' }) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="skeleton h-24 mb-4"
        />
      ))}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="luxury-card p-6">
      <div className="skeleton h-6 w-3/4 mb-4"></div>
      <div className="skeleton h-4 w-full mb-2"></div>
      <div className="skeleton h-4 w-5/6"></div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="luxury-card overflow-hidden">
      <div className="p-6">
        <div className="skeleton h-6 w-1/4 mb-6"></div>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex space-x-4 mb-4">
            <div className="skeleton h-4 w-1/4"></div>
            <div className="skeleton h-4 w-1/4"></div>
            <div className="skeleton h-4 w-1/3"></div>
            <div className="skeleton h-4 w-1/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;

