import React from 'react';
import { Star } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="relative animate-spin">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
          <Star className="h-8 w-8 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white font-bold">
          5
        </div>
      </div>
      <p className="mt-4 text-purple-200">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;