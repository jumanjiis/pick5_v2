import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Edit2, Save, ArrowLeft, Target, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Player, PlayerTarget, Match } from '../../types';

const ManagePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    team: '',
    role: 'batsman' as Player['role']
  });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingTargets, setEditingTargets] = useState<{ [key: string]: PlayerTarget }>({});
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [matches, setMatches] = useState<(Match & { id: string })[]>([]);

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const matchesSnapshot = await getDocs(collection(db, 'matches'));
      const matchesData = matchesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as (Match & { id: string })[];

      // Sort matches by date
      const sortedMatches = matchesData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setMatches(sortedMatches);
      
      if (sortedMatches.length > 0) {
        setSelectedMatch(sortedMatches[0].id);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const playersSnapshot = await getDocs(collection(db, 'players'));
      const playersData = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'players'), {
        ...newPlayer,
        matchTargets: {}
      });
      setNewPlayer({ name: '', team: '', role: 'batsman' });
      fetchPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await deleteDoc(doc(db, 'players', playerId));
      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    try {
      const updatedMatchTargets = {
        ...editingPlayer.matchTargets,
        [selectedMatch]: {
          ...editingTargets[editingPlayer.id],
          isSelected: true
        }
      };

      await updateDoc(doc(db, 'players', editingPlayer.id), {
        name: editingPlayer.name,
        team: editingPlayer.team,
        role: editingPlayer.role,
        matchTargets: updatedMatchTargets
      });
      
      setEditingPlayer(null);
      setEditingTargets({});
      fetchPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const handleEditTargets = (player: Player) => {
    setEditingPlayer(player);
    setEditingTargets({
      [player.id]: player.matchTargets?.[selectedMatch] || {
        type: player.role === 'bowler' ? 'wickets' : 'runs',
        target: 0,
        actualPoints: undefined,
        isSelected: false
      }
    });
  };

  const handleTogglePlayerSelection = async (player: Player) => {
    try {
      const currentTargets = player.matchTargets || {};
      const isCurrentlySelected = currentTargets[selectedMatch]?.isSelected;

      const updatedTargets = {
        ...currentTargets,
        [selectedMatch]: {
          ...(currentTargets[selectedMatch] || {
            type: player.role === 'bowler' ? 'wickets' : 'runs',
            target: 0,
            actualPoints: undefined
          }),
          isSelected: !isCurrentlySelected
        }
      };

      await updateDoc(doc(db, 'players', player.id), {
        matchTargets: updatedTargets
      });

      fetchPlayers();
    } catch (error) {
      console.error('Error toggling player selection:', error);
    }
  };

  const getMatchStatus = (match: Match) => {
    const now = new Date();
    if (match.timestamp > now) return 'upcoming';
    if (match.status === 'completed') return 'completed';
    return 'live';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Admin Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Player Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Add New Player</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2">Name</label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={e => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Team</label>
                <input
                  type="text"
                  value={newPlayer.team}
                  onChange={e => setNewPlayer(prev => ({ ...prev, team: e.target.value }))}
                  required
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Role</label>
                <select
                  value={newPlayer.role}
                  onChange={e => setNewPlayer(prev => ({ ...prev, role: e.target.value as Player['role'] }))}
                  required
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all-rounder">All-Rounder</option>
                  <option value="wicket-keeper">Wicket Keeper</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Player
              </button>
            </form>
          </div>

          {/* Players List */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Manage Players</h2>
              
              {/* Match Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-purple-200">Select Match:</label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                >
                  {matches.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.description || `${match.team1} vs ${match.team2}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`bg-white/5 rounded-lg p-4 flex items-center justify-between group transition-colors
                      ${player.matchTargets?.[selectedMatch]?.isSelected ? 'bg-green-500/10 hover:bg-green-500/20' : 'hover:bg-white/10'}`}
                  >
                    {editingPlayer?.id === player.id ? (
                      <form onSubmit={handleUpdatePlayer} className="flex-1 grid grid-cols-6 gap-4 items-center">
                        <input
                          type="text"
                          value={editingPlayer.name}
                          onChange={e => setEditingPlayer(prev => ({ ...prev!, name: e.target.value }))}
                          className="bg-white/5 border border-purple-500/20 rounded px-2 py-1 text-white"
                        />
                        <input
                          type="text"
                          value={editingPlayer.team}
                          onChange={e => setEditingPlayer(prev => ({ ...prev!, team: e.target.value }))}
                          className="bg-white/5 border border-purple-500/20 rounded px-2 py-1 text-white"
                        />
                        <select
                          value={editingPlayer.role}
                          onChange={e => setEditingPlayer(prev => ({ ...prev!, role: e.target.value as Player['role'] }))}
                          className="bg-white/5 border border-purple-500/20 rounded px-2 py-1 text-white"
                        >
                          <option value="batsman">Batsman</option>
                          <option value="bowler">Bowler</option>
                          <option value="all-rounder">All-Rounder</option>
                          <option value="wicket-keeper">Wicket Keeper</option>
                        </select>
                        <div className="flex space-x-2">
                          <select
                            value={editingTargets[player.id]?.type || 'runs'}
                            onChange={e => setEditingTargets(prev => ({
                              ...prev,
                              [player.id]: { ...prev[player.id], type: e.target.value as 'runs' | 'wickets' }
                            }))}
                            className="bg-white/5 border border-purple-500/20 rounded px-2 py-1 text-white"
                          >
                            <option value="runs">Runs</option>
                            <option value="wickets">Wickets</option>
                          </select>
                          <input
                            type="number"
                            value={editingTargets[player.id]?.target || 0}
                            onChange={e => setEditingTargets(prev => ({
                              ...prev,
                              [player.id]: { ...prev[player.id], target: parseInt(e.target.value) }
                            }))}
                            className="bg-white/5 border border-purple-500/20 rounded px-2 py-1 text-white w-20"
                            placeholder="Target"
                          />
                        </div>
                        <input
                          type="number"
                          value={editingTargets[player.id]?.actualPoints ?? ''}
                          onChange={e => setEditingTargets(prev => ({
                            ...prev,
                            [player.id]: { ...prev[player.id], actualPoints: parseInt(e.target.value) }
                          }))}
                          className="bg-white/5 border border-purple-500/20 rounded px-2 py-1 text-white"
                          placeholder="Actual Points"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlayer(null);
                              setEditingTargets({});
                            }}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                          <div>
                            <h3 className="text-white font-semibold">{player.name}</h3>
                            <p className="text-purple-200 text-sm">{player.role}</p>
                          </div>
                          <div>
                            <p className="text-purple-200">{player.team}</p>
                          </div>
                          <div>
                            {player.matchTargets?.[selectedMatch]?.isSelected ? (
                              <span className="text-green-400 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Selected
                              </span>
                            ) : (
                              <span className="text-gray-400">Not Selected</span>
                            )}
                          </div>
                          <div>
                            {player.matchTargets?.[selectedMatch] ? (
                              <div className="flex items-center space-x-2">
                                <Target className="h-4 w-4 text-green-400" />
                                <span className="text-green-400">
                                  {player.matchTargets[selectedMatch].target} {player.matchTargets[selectedMatch].type}
                                </span>
                              </div>
                            ) : (
                              <span className="text-yellow-400">No target set</span>
                            )}
                          </div>
                          <div>
                            {player.matchTargets?.[selectedMatch]?.actualPoints !== undefined ? (
                              <span className="text-blue-400">
                                Actual: {player.matchTargets[selectedMatch].actualPoints}
                              </span>
                            ) : (
                              <span className="text-gray-400">No points recorded</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 justify-end">
                            <button
                              onClick={() => handleTogglePlayerSelection(player)}
                              className={`p-2 ${
                                player.matchTargets?.[selectedMatch]?.isSelected
                                  ? 'text-green-400 hover:text-green-300'
                                  : 'text-gray-400 hover:text-white'
                              } transition-colors`}
                            >
                              {player.matchTargets?.[selectedMatch]?.isSelected ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Plus className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditTargets(player)}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player.id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePlayers;