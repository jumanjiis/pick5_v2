import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Target, Trophy, Users, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (user) {
      navigate('/dashboard');
      return;
    }

    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-20 pb-8 sm:pb-16 relative">
        {/* Main CTA */}
        <div className="text-center mb-8 sm:mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-16 sm:h-24 animate-float">
            <div className="relative">
              <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Award className="h-8 sm:h-12 w-8 sm:w-12 text-white animate-spin-slow" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 sm:w-8 h-6 sm:h-8 bg-green-400 rounded-full flex items-center justify-center text-white font-bold animate-bounce">
                5
              </div>
            </div>
          </div>

          <div className="pt-24 sm:pt-32 animate-fade-in">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-4 sm:p-8 max-w-4xl mx-auto border border-white/10">
              <h1 className="text-3xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-400 to-emerald-500 mb-4 sm:mb-6">
                Win ₹10,000 Every Match!
              </h1>
              
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-lg sm:text-2xl text-white">
                  <div className="flex items-center">
                    <span className="animate-pulse">🏏</span>
                    <span className="mx-2">Pick 5 Players</span>
                  </div>
                  <span className="hidden sm:block animate-pulse">→</span>
                  <div className="flex items-center">
                    <span>Beat Targets</span>
                    <span className="mx-2 animate-pulse">→</span>
                    <span>Win ₹10,000</span>
                    <span className="ml-2 animate-pulse">🏆</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 sm:p-6 border border-green-500/20">
                  <p className="text-base sm:text-lg text-white">
                    <span className="font-bold text-green-400">Example:</span> Pick Virat Kohli (Target: 30 runs)
                    <br className="hidden sm:block" />
                    <span className="block mt-2">If he scores 30+ runs, you get one pick right!</span>
                    <span className="block mt-2 font-bold text-green-400 text-lg sm:text-xl">Get all 5 picks right = Win ₹10,000! 🎯</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleGetStarted}
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse-slow mt-6 sm:mt-8"
              >
                {user ? 'Go to Dashboard' : 'Start Playing Now'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 sm:mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12 animate-fade-in">
            Three Steps to Victory 🏆
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <Step 
              number={1} 
              title="Pick a Match"
              description="Choose from upcoming cricket matches"
              emoji="🏏"
              delay="delay-100"
            />
            <Step 
              number={2} 
              title="Select 5 Players"
              description="Pick players who'll beat their target scores"
              emoji="🎯"
              delay="delay-200"
            />
            <Step 
              number={3} 
              title="Win ₹10,000"
              description="Get all 5 predictions right to win!"
              emoji="💰"
              delay="delay-300"
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 px-4">
          <FeatureCard
            icon={<Target className="h-6 sm:h-8 w-6 sm:w-8 text-green-400" />}
            title="Fair Targets"
            description="All targets are based on player statistics and form"
            delay="delay-100"
          />
          <FeatureCard
            icon={<Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-400" />}
            title="Instant Rewards"
            description="Winners receive prizes immediately after match"
            delay="delay-200"
          />
          <FeatureCard
            icon={<Users className="h-6 sm:h-8 w-6 sm:w-8 text-blue-400" />}
            title="Growing Community"
            description="Join thousands of cricket fans playing daily"
            delay="delay-300"
          />
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-24 bg-black/20 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0 animate-fade-in">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                <span className="text-white font-semibold">Pick5</span>
              </div>
              <p className="text-purple-200 text-sm animate-fade-in">
                © {new Date().getFullYear()} Pick5. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: string;
}) => (
  <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 animate-slide-up ${delay} hover:bg-white/20 border border-white/10`}>
    <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-white/10 rounded-lg mb-3 sm:mb-4 group-hover:animate-bounce">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-purple-200">{description}</p>
  </div>
);

const Step = ({ number, title, description, emoji, delay }: {
  number: number;
  title: string;
  description: string;
  emoji: string;
  delay: string;
}) => (
  <div className={`flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 animate-slide-up ${delay} p-4`}>
    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 animate-pulse-slow relative">
      {number}
      <span className="absolute -top-2 -right-2 text-xl sm:text-2xl animate-bounce">{emoji}</span>
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-purple-200">{description}</p>
  </div>
);

export default Home;