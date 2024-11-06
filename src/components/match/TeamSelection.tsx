import React from 'react';
import PlayerCard from './PlayerCard';
import type { Player } from '../../types';

interface TeamSelectionProps {
  teamName: string;
  players: Player[];
  selectedPlayers: Player[];
  onPlayerSelect: (player: Player) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  teamName,
  players,
  selectedPlayers,
  onPlayerSelect,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
      <h3 className="text-xl font-bold text-white mb-4">{teamName}</h3>
      <div className="space-y-3">
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            isSelected={!!selectedPlayers.find(p => p.id === player.id)}
            onSelect={onPlayerSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamSelection;