import React from 'react';
import { collection, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Match, Player } from '../types';
import { format } from 'date-fns';
import { Calendar, Star, Crown, Trophy, ArrowRight, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = React.useState<(Match & { players: Player[] })[]>([]);
  const [predictions, setPredictions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'live' | 'completed'>('upcoming');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all matches ordered by timestamp
        const matchesRef = collection(db, 'matches');
        const matchesQuery = query(matchesRef, orderBy('timestamp', 'desc'));
        const matchesSnapshot = await getDocs(matchesQuery);
        
        const matchesData = await Promise.all(
          matchesSnapshot.docs.map(async (doc) => {
            const matchData = { 
              id: doc.id, 
              ...doc.data(),
              timestamp: doc.data().timestamp instanceof Timestamp 
                ? doc.data().timestamp.toDate() 
                : new Date(doc.data().timestamp)
            } as Match;
            
            // Fetch players for each match
            const playersRef = collection(db, 'players');
            const playersSnapshot = await getDocs(playersRef);
            const players = playersSnapshot.docs.map(playerDoc => ({
              id: playerDoc.id,
              ...playerDoc.data()
            })) as Player[];

            return {
              ...matchData,
              players
            };
          })
        );

        setMatches(matchesData);

        // Fetch predictions if user is logged in
        if (user) {
          const predictionsRef = collection(db, 'predictions');
          const predictionsQuery = query(
            predictionsRef,
            where('userId', '==', user.uid)
          );
          const predictionsSnapshot = await getDocs(predictionsQuery);
          const predictionsData = predictionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPredictions(predictionsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getMatchStatus = (match: Match) => {
    const now = new Date();
    if (match.timestamp > now) return 'upcoming';
    if (match.status === 'completed') return 'completed';
    return 'live';
  };

  const getTimeStatus = (timestamp: Date) => {
    const now = new Date();
    const diff = timestamp.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return 'Started';
    if (hours === 0) return 'Starting soon';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getCorrectPredictions = (prediction: any) => {
    return prediction.selectedPlayers.reduce((acc: number, player: any) => {
      if (player.actualPoints !== undefined && player.actualPoints >= player.target) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  const upcomingMatches = matches.filter(match => getMatchStatus(match) === 'upcoming');
  const completedMatches = matches.filter(match => getMatchStatus(match) === 'completed');
  const liveMatches = matches.filter(match => getMatchStatus(match) === 'live');

  const renderMatchCard = (match: Match & { players: Player[] }) => {
    const prediction = predictions.find(p => p.matchId === match.id);
    const status = getMatchStatus(match);
    const timeStatus = getTimeStatus(match.timestamp);
    const correctPredictions = prediction ? getCorrectPredictions(prediction) : 0;

    return (
      <div key={match.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden">
        {/* Match Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium text-purple-200 truncate pr-2">
              {match.description || `${match.team1} vs ${match.team2}`}
            </h3>
            <span className="text-sm text-purple-200 whitespace-nowrap">{timeStatus}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">{match.team1} vs {match.team2}</h2>
              </div>
              <div className="flex items-center text-sm text-purple-200">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="truncate">{format(match.timestamp, 'PPp')}</span>
              </div>
            </div>

            {status === 'upcoming' ? (
              <Link
                to={`/predict/${match.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                {prediction ? 'Update Prediction' : 'Make Prediction'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : prediction ? (
              <Link
                to={`/predict/${match.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Result ({correctPredictions}/5)
              </Link>
            ) : (
              <div className="inline-flex items-center text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>No prediction</span>
              </div>
            )}
          </div>

          {/* Show selections for matches with predictions */}
          {prediction && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {prediction.selectedPlayers.map((player: any, index: number) => (
                <div key={index} className="bg-white/5 rounded-lg p-2 relative text-sm">
                  {status !== 'upcoming' && player.actualPoints !== undefined && (
                    <div className="absolute -top-1 -right-1">
                      {player.actualPoints >= player.target ? (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-white font-medium truncate">{player.name}</p>
                  <p className="text-xs text-purple-200">Target: {player.target} {player.type}</p>
                  {status !== 'upcoming' && player.actualPoints !== undefined && (
                    <p className={`text-xs ${
                      player.actualPoints >= player.target ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Actual: {player.actualPoints}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-4 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Stats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white truncate">{user?.displayName}</h2>
              <div className="flex items-center space-x-4">
                <div className="text-purple-200">
                  <span className="text-xl font-bold text-yellow-400">{predictions.length}</span>
                  <span className="text-sm ml-1">Predictions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              activeTab === 'upcoming'
                ? 'bg-white/10 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              activeTab === 'live'
                ? 'bg-white/10 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              activeTab === 'completed'
                ? 'bg-white/10 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Match Lists */}
        <div className="space-y-4">
          {activeTab === 'live' && liveMatches.length > 0 && (
            liveMatches.map(renderMatchCard)
          )}

          {activeTab === 'upcoming' && (
            upcomingMatches.length > 0 ? (
              upcomingMatches.map(renderMatchCard)
            ) : (
              <EmptyState />
            )
          )}

          {activeTab === 'completed' && (
            completedMatches.length > 0 ? (
              completedMatches.map(renderMatchCard)
            ) : (
              <div className="text-center py-8 bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20">
                <p className="text-purple-200">No completed matches yet</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;