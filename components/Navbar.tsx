import React from 'react';
import { ViewState, User } from '../types';

interface NavbarProps {
  user: User | null;
  setView: (view: ViewState) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setView, onLogout }) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView(user ? ViewState.DASHBOARD : ViewState.LANDING)}>
            <div className="h-8 w-8 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-lg mr-2 animate-pulse-slow"></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MeetPulse
            </span>
          </div>
          <div className="flex space-x-4">
            {user ? (
              <>
                 <span className="hidden md:flex items-center text-slate-400 text-sm mr-2">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setView(ViewState.LOGIN)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setView(ViewState.SIGNUP)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-full transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
