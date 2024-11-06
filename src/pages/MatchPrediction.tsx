import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, getDocs, query, where, setDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AlertCircle, Save, Trophy, X, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import type { Match, Player, PlayerTarget } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const MatchPrediction = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = React.useState<Match | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = React.useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = React.useState<Player[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [existingPredictionId, setExistingPredictionId] = React.useState<string | null>(null);
  const [recentlySelected, setRecentlySelected] = React.useState<string | null>(null);
  const [matchStarted, setMatchStarted] = React.useState(false);
  const [correctPredictions, setCorrectPredictions] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!matchId || !user) {
          throw new Error('Match ID and user are required');
        }

        // Fetch match data
        const matchDoc = await getDoc(doc(db, 'matches', matchId));
        if (!matchDoc.exists()) {
          throw new Error('Match not found');
        }
        
        const matchData = { 
          id: matchDoc.id, 
          ...matchDoc.data(),
          timestamp: matchDoc.data().timestamp instanceof Timestamp 
            ? matchDoc.data().timestamp.toDate() 
            : new Date(matchDoc.data().timestamp)
        } as Match;

        // Check if match has started
        const hasStarted = new Date() >= matchData.timestamp;
        setMatchStarted(hasStarted);
        setMatch(matchData);

        // Fetch all players
        const playersQuery = query(collection(db, 'players'));
        const playersSnapshot = await getDocs(playersQuery);
        const allPlayers = playersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];

        // Filter players that have targets for this match
        const playersWithTargets = allPlayers.filter(
          player => player.matchTargets && player.matchTargets[matchId]
        );

        // Fetch existing prediction
        const predictionsQuery = query(
          collection(db, 'predictions'),
          where('userId', '==', user.uid),
          where('matchId', '==', matchId)
        );
        const predictionsSnapshot = await getDocs(predictionsQuery);
        
        if (!predictionsSnapshot.empty) {
          const prediction = predictionsSnapshot.docs[0];
          setExistingPredictionId(prediction.id);
          const selectedPlayerIds = prediction.data().selectedPlayers.map((p: any) => p.id);
          const selectedPlayers = playersWithTargets.filter(p => selectedPlayerIds.includes(p.id));
          setSelectedPlayers(selectedPlayers);
          setAvailablePlayers(playersWithTargets.filter(p => !selectedPlayerIds.includes(p.id)));

          // Calculate correct predictions if match has started
          if (hasStarted) {
            const correct = selectedPlayers.reduce((acc, player) => {
              const target = player.matchTargets[matchId];
              if (target.actualPoints !== undefined) {
                return acc + (target.actualPoints >= target.target ? 1 : 0);
              }
              return acc;
            }, 0);
            setCorrectPredictions(correct);
          }
        } else {
          setAvailablePlayers(playersWithTargets);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load match data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId, user]);

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.length >= 5 || matchStarted) return;
    setSelectedPlayers(prev => [...prev, player]);
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
    setRecentlySelected(player.id);
    setTimeout(() => setRecentlySelected(null), 500);
  };

  const handlePlayerRemove = (player: Player) => {
    if (matchStarted) return;
    setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
    setAvailablePlayers(prev => [...prev, player]);
  };

  const getPlayerTarget = (player: Player): PlayerTarget => {
    return player.matchTargets[matchId!];
  };

  const handleSubmit = async () => {
    if (!match || selectedPlayers.length !== 5 || !user || submitting || matchStarted) return;
    setSubmitting(true);

    try {
      const predictionData = {
        userId: user.uid,
        userEmail: user.email,
        matchId: match.id,
        selectedPlayers: selectedPlayers.map(player => ({
          id: player.id,
          name: player.name,
          team: player.team,
          ...getPlayerTarget(player)
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending'
      };

      if (existingPredictionId) {
        // Update existing prediction
        await setDoc(doc(db, 'predictions', existingPredictionId), predictionData);
      } else {
        // Create new prediction
        await addDoc(collection(db, 'predictions'), predictionData);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving prediction:', err);
      setError('Failed to save prediction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 max-w-md w-full text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-purple-200">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (!match) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>

        {/* Match Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{match.team1} vs {match.team2}</h2>
              <p className="text-purple-200">
                {match.timestamp && format(match.timestamp, 'PPP p')} • {match.venue}
              </p>
              {match.description && (
                <p className="mt-3 text-purple-200">{match.description}</p>
              )}
            </div>
            {matchStarted && (
              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                <span>Match Started • {correctPredictions}/5 Correct</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Players */}
        <div className="mb-8 animate-slide-up">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Star className="h-6 w-6 mr-2 text-yellow-400" />
            Your Selection ({selectedPlayers.length}/5)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => {
              const player = selectedPlayers[index];
              return (
                <div 
                  key={index} 
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border-2 border-dashed 
                    ${player ? 'border-green-500/50 animate-glow' : 'border-purple-500/30'} 
                    relative transition-all duration-300`}
                >
                  {player ? (
                    <>
                      {!matchStarted && (
                        <button
                          onClick={() => handlePlayerRemove(player)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                        >
                          <X className="h-4 w-4 text-red-400" />
                        </button>
                      )}
                      <div className={`flex flex-col items-center text-center ${
                        recentlySelected === player.id ? 'animate-celebrate' : ''
                      }`}>
                        {matchStarted && (
                          <div className="absolute -top-3 -right-3">
                            {getPlayerTarget(player).actualPoints !== undefined && (
                              getPlayerTarget(player).actualPoints >= getPlayerTarget(player).target ? (
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <X className="h-5 w-5 text-white" />
                                </div>
                              )
                            )}
                          </div>
                        )}
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-white">{player.name}</h4>
                        <p className="text-sm text-green-200">{player.team}</p>
                        <div className="mt-2 space-y-1">
                          <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-200 text-sm">
                            Target: {getPlayerTarget(player).target} {getPlayerTarget(player).type}
                          </div>
                          {matchStarted && getPlayerTarget(player).actualPoints !== undefined && (
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              getPlayerTarget(player).actualPoints >= getPlayerTarget(player).target
                                ? 'bg-green-500/20 text-green-200'
                                : 'bg-red-500/20 text-red-200'
                            }`}>
                              Actual: {getPlayerTarget(player).actualPoints}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-purple-300">
                      {matchStarted ? 'No Selection' : 'Select Player'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!matchStarted && (
          <>
            {/* Available Players */}
            <div className="mb-8 animate-slide-up delay-200">
              <h3 className="text-xl font-semibold text-white mb-4">Available Players</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availablePlayers.map(player => {
                  const target = getPlayerTarget(player);
                  return (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      disabled={selectedPlayers.length >= 5}
                      className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 text-left 
                        player-card-hover
                        ${selectedPlayers.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                        ${recentlySelected === player.id ? 'animate-pop' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{player.name}</h4>
                          <p className="text-sm text-purple-200">{player.team}</p>
                          <div className="mt-1 text-xs text-purple-300">
                            Target: {target.target} {target.type}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end animate-slide-up delay-300">
              <button
                onClick={handleSubmit}
                disabled={selectedPlayers.length !== 5 || submitting}
                className={`flex items-center px-6 py-3 text-base font-semibold rounded-xl ${
                  selectedPlayers.length === 5 && !submitting
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 animate-glow'
                    : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                } transition-all duration-300`}
              >
                <Save className="h-5 w-5 mr-2" />
                {submitting ? 'Saving...' : existingPredictionId ? 'Update Prediction' : 'Save Prediction'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchPrediction;