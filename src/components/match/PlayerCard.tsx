import React from 'react';
import { Trophy } from 'lucide-react';
import type { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  onSelect: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isSelected,
  onSelect,
}) => {
  const avgTarget = 'type' in player.possibleTargets 
    ? `${player.possibleTargets.avgTarget} ${player.possibleTargets.type}`
    : `${player.possibleTargets.runs.avgTarget} runs / ${player.possibleTargets.wickets.avgTarget} wickets`;

  return (
    <button
      onClick={() => onSelect(player)}
      className={`w-full p-4 rounded-xl transition-all duration-300 ${
        isSelected
          ? 'bg-purple-600 text-white'
          : 'bg-white/5 text-purple-200 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className={`h-5 w-5 ${isSelected ? 'text-yellow-400' : ''}`} />
          <div className="text-left">
            <p className="font-semibold">{player.name}</p>
            <p className="text-sm opacity-80">{player.role}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">Avg Target</p>
          <p className="font-semibold">{avgTarget}</p>
        </div>
      </div>
    </button>
  );
};

export default PlayerCard;