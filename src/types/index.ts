export interface Match {
  id: string;
  team1: string;
  team2: string;
  timestamp: Date;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  description?: string;
}

export interface PlayerTarget {
  type: 'runs' | 'wickets';
  target: number;
  actualPoints?: number;
  isSelected: boolean;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  matchTargets: {
    [matchId: string]: PlayerTarget;
  };
}