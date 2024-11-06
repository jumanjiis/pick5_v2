import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import TeamPlayers from './TeamPlayers';
import type { Match, Player } from '../types';

type MatchCardProps = {
  match: Match & { players: Player[] };
};

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{match.team1} vs {match.team2}</h2>
            <div className="flex items-center mt-2 text-purple-100">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{new Date(match.date).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{match.venue}</span>
            </div>
          </div>
          <Link
            to={`/predict/${match.id}`}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center"
          >
            Predict
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Players Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamPlayers 
            teamName={match.team1}
            players={match.players.filter(player => player.team === match.team1)}
            colorScheme="purple"
          />
          <TeamPlayers 
            teamName={match.team2}
            players={match.players.filter(player => player.team === match.team2)}
            colorScheme="blue"
          />
        </div>
      </div>
    </div>
  );
};

export default MatchCard;