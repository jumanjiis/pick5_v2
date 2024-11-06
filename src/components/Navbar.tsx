import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Star, Shield, Trophy, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-indigo-900/95 backdrop-blur-lg border-b border-purple-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Star className="h-8 w-8 text-yellow-400 group-hover:animate-spin" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  5
                </div>
              </div>
              <span className="text-xl font-bold text-white">Pick5</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link 
              to="/leaderboard" 
              className="text-yellow-400 hover:text-yellow-300 flex items-center space-x-2 transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              <Trophy className="h-5 w-5" />
              <span>Leaderboard</span>
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-white/90 hover:text-white flex items-center space-x-2 transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  <User className="h-5 w-5" />
                  <span>{user.displayName || 'Dashboard'}</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-2 transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-indigo-900/95 border-t border-purple-500/20">
          <div className="px-4 pt-2 pb-3 space-y-2">
            <Link
              to="/leaderboard"
              className="flex items-center space-x-2 text-yellow-400 p-3 rounded-lg hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              <Trophy className="h-5 w-5" />
              <span>Leaderboard</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-white p-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>{user.displayName || 'Dashboard'}</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-emerald-400 p-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white w-full p-3 rounded-lg hover:bg-white/10"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-lg hover:from-pink-600 hover:to-purple-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;