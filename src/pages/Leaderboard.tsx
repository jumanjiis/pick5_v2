import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Match } from '../types';

type LeaderboardEntry = {
  userId: string;
  userEmail: string;
  displayName: string;
  correctPredictions: number;
  totalPredictions: number;
  matchId: string;
  matchDetails: Match;
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<string>('all');
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchCompletedMatches();
  }, []);

  const fetchCompletedMatches = async () => {
    try {
      const matchesRef = collection(db, 'matches');
      const matchesQuery = query(matchesRef, where('status', '==', 'completed'));
      const matchesSnapshot = await getDocs(matchesQuery);
      const matches = matchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as Match[];

      setCompletedMatches(matches);
      if (matches.length > 0) {
        setSelectedMatch(matches[0].id);
        await fetchLeaderboard(matches[0].id);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (matchId: string) => {
    setLoading(true);
    try {
      const predictionsRef = collection(db, 'predictions');
      const predictionsQuery = query(
        predictionsRef,
        where('matchId', '==', matchId)
      );
      const predictionsSnapshot = await getDocs(predictionsQuery);
      
      const leaderboardData: LeaderboardEntry[] = [];
      
      for (const doc of predictionsSnapshot.docs) {
        const prediction = doc.data();
        const correctPredictions = prediction.selectedPlayers.reduce((acc: number, player: any) => {
          if (player.actualPoints !== undefined && player.actualPoints >= player.target) {
            return acc + 1;
          }
          return acc;
        }, 0);

        // Get match details
        const matchDoc = await getDocs(query(collection(db, 'matches'), where('id', '==', prediction.matchId)));
        const matchDetails = matchDoc.docs[0]?.data() as Match;

        leaderboardData.push({
          userId: prediction.userId,
          userEmail: prediction.userEmail,
          displayName: prediction.userEmail.split('@')[0], // Simple display name from email
          correctPredictions,
          totalPredictions: prediction.selectedPlayers.length,
          matchId: prediction.matchId,
          matchDetails
        });
      }

      // Sort by correct predictions (descending)
      const sortedLeaderboard = leaderboardData.sort((a, b) => b.correctPredictions - a.correctPredictions);
      setLeaderboard(sortedLeaderboard); // Show all players
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchChange = async (matchId: string) => {
    setSelectedMatch(matchId);
    await fetchLeaderboard(matchId);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-purple-400" />;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
              Leaderboard
            </h1>
            <select
              value={selectedMatch}
              onChange={(e) => handleMatchChange(e.target.value)}
              className="bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
            >
              {completedMatches.map(match => (
                <option key={match.id} value={match.id}>
                  {match.team1} vs {match.team2}
                </option>
              ))}
            </select>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`bg-white/5 rounded-lg p-4 flex items-center justify-between transition-transform hover:scale-102 ${
                    index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                    index === 1 ? 'bg-gray-500/10 border border-gray-500/20' :
                    index === 2 ? 'bg-amber-500/10 border border-amber-500/20' :
                    'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{entry.displayName}</h3>
                      <p className="text-purple-200 text-sm">
                        {entry.correctPredictions} correct out of {entry.totalPredictions}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' :
                      'text-purple-400'
                    }`}>
                      {entry.correctPredictions * 20}%
                    </div>
                    <div className="text-purple-200 text-sm">Accuracy</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-purple-200">No predictions found for this match</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;