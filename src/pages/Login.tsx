import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20">
        <div className="animate-fade-in">
          <div className="flex justify-center">
            <div className="relative animate-float">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-400 rounded-full flex items-center justify-center text-white font-bold animate-bounce">
                5
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200">
            Welcome to Pick5
          </h2>
          <p className="mt-2 text-center text-sm text-purple-200">
            Join thousands of cricket fans making predictions
          </p>
        </div>
        <div className="mt-8 space-y-6 animate-slide-up">
          <button
            onClick={handleGoogleSignIn}
            className="group relative w-full flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
          >
            Continue with Google
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="mt-6 animate-slide-up-delayed">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-purple-200">
                By signing in, you agree to our Terms and Privacy Policy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;