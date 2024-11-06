import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserPredictionsProps {
  prediction: {
    id: string;
    matchId: string;
    matchDetails: {
      team1: string;
      team2: string;
      date: string;
      venue: string;
    };
    predictions: Array<{
      playerName: string;
      target: number;
      type: 'runs' | 'wickets';
    }>;
    status: 'pending' | 'completed';
  };
}

const UserPredictions: React.FC<UserPredictionsProps> = ({ prediction }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {prediction.matchDetails.team1} vs {prediction.matchDetails.team2}
            </h3>
            <p className="text-indigo-100 text-sm mt-1">
              {format(new Date(prediction.matchDetails.date), 'PPP')} • {prediction.matchDetails.venue}
            </p>
          </div>
          <Link
            to={`/predict/${prediction.matchId}`}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {prediction.predictions.map((playerPrediction, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-lg p-3 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900">{playerPrediction.playerName}</h4>
              <p className="text-sm text-gray-600">
                Target: {playerPrediction.target} {playerPrediction.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPredictions;