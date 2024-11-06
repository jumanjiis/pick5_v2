import React from 'react';
import type { Match } from '../../types';

interface MatchHeaderProps {
  match: Match;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({ match }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white border border-purple-500/20">
      <h2 className="text-2xl font-bold">{match.team1} vs {match.team2}</h2>
      <p className="text-purple-200 mt-2">
        {new Date(match.date).toLocaleDateString()} • {match.venue}
      </p>
    </div>
  );
};

export default MatchHeader;