import React from 'react';
import { Users } from 'lucide-react';
import type { Player } from '../types';

type TeamPlayersProps = {
  teamName: string;
  players: Player[];
  colorScheme: 'purple' | 'blue';
};

const TeamPlayers: React.FC<TeamPlayersProps> = ({ teamName, players, colorScheme }) => {
  const bgColor = colorScheme === 'purple' ? 'bg-purple-50' : 'bg-blue-50';
  const textColor = colorScheme === 'purple' ? 'text-purple-600' : 'text-blue-600';
  const bgColorDark = colorScheme === 'purple' ? 'bg-purple-600' : 'bg-blue-600';

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className={`h-5 w-5 mr-2 ${textColor}`} />
        {teamName} Players
      </h3>
      <div className="space-y-3">
        {players.map(player => (
          <div key={player.id} className={`flex items-center space-x-3 p-3 ${bgColor} rounded-lg`}>
            <div className={`w-10 h-10 ${bgColorDark} rounded-full flex items-center justify-center text-white font-bold`}>
              {player.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{player.name}</p>
              <p className="text-sm text-gray-600 capitalize">{player.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPlayers;