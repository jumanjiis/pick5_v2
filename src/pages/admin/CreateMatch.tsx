import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, MapPin, Clock, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateMatch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    venue: '',
    date: '',
    time: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const timestamp = new Date(`${formData.date}T${formData.time}`);
      
      await addDoc(collection(db, 'matches'), {
        team1: formData.team1,
        team2: formData.team2,
        venue: formData.venue,
        timestamp,
        description: formData.description,
        status: 'upcoming'
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error creating match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Admin Dashboard
        </Link>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
          <h1 className="text-2xl font-bold text-white mb-6">Create New Match</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team 1 */}
              <div>
                <label className="block text-purple-200 mb-2">Team 1</label>
                <input
                  type="text"
                  name="team1"
                  value={formData.team1}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Enter team name"
                />
              </div>

              {/* Team 2 */}
              <div>
                <label className="block text-purple-200 mb-2">Team 2</label>
                <input
                  type="text"
                  name="team2"
                  value={formData.team2}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Enter team name"
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-purple-200 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                placeholder="Enter match venue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-purple-200 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-purple-200 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-purple-200 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                placeholder="Enter match description"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Creating...' : 'Create Match'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMatch;