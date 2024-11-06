import React from 'react';
import { Save } from 'lucide-react';

interface SubmitButtonProps {
  onSubmit: () => void;
  disabled: boolean;
  submitting: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit, disabled, submitting }) => {
  return (
    <div className="flex justify-end">
      <button
        onClick={onSubmit}
        disabled={disabled || submitting}
        className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
          !disabled && !submitting
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transform hover:scale-105'
            : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Save className="h-5 w-5 mr-2" />
        {submitting ? 'Saving...' : 'Save Predictions'}
      </button>
    </div>
  );
};

export default SubmitButton;