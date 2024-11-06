import React from 'react';
import { Star } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12 bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20">
      <div className="animate-float">
        <Star className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
      </div>
      <h3 className="text-xl font-medium text-white mb-2">No matches available</h3>
      <p className="text-purple-200">Check back later for upcoming matches</p>
    </div>
  );
};

export default EmptyState;