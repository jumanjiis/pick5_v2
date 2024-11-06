import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-200">
      <AlertCircle className="h-5 w-5 mr-2" />
      {message}
    </div>
  );
};

export default ErrorMessage;