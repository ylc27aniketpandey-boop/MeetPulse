import React, { useState, useEffect } from 'react';
import { User, Note, ViewState } from './types';
import { storageService } from './services/storage';
import Navbar from './components/Navbar';
import PlasmaBackground from './components/PlasmaBackground';
import GeometricHero from './components/GeometricHero';
import NoteModal from './components/NoteModal';

// Icons
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial Load
  useEffect(() => {
    const session = storageService.getSession();
    if (session) {
      setUser(session.user);
      setView(ViewState.DASHBOARD);
      loadNotes(session.user.id);
    }
  }, []);

  const loadNotes = async (userId: string) => {
    const loadedNotes = await storageService.getNotes(userId);
    setNotes(loadedNotes);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { user } = await storageService.login(email, password);
      setUser(user);
      setView(ViewState.DASHBOARD);
      loadNotes(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { user } = await storageService.register(name, email, password);
      setUser(user);
      setView(ViewState.DASHBOARD);
      loadNotes(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    setNotes([]);
    setView(ViewState.LANDING);
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (!user) return;
    try {
      await storageService.saveNote({ ...noteData, userId: user.id });
      loadNotes(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await storageService.deleteNote(noteId);
      if (user) loadNotes(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q)) ||
      n.content.toLowerCase().includes(q)
    );
  });

  // Views
  const renderLanding = () => (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-100">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0">
        <PlasmaBackground />
      </div>
      <div className="fixed inset-0 z-0 opacity-60">
        <GeometricHero />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full text-center space-y-8 mt-10 md:mt-20">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-4 animate-float">
            <span className="flex h-2 w-2 rounded-full bg-accent-400"></span>
            <span className="text-sm font-medium text-slate-300">New: AI-Powered Summaries</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-2xl">
            Turn meeting chaos into<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-500">
              clear action plans.
            </span>
          </h1>

          {/* Subhead */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed">
            Stop losing context in long threads. MeetPulse provides automated summaries, 
            intelligent action extraction, and a secure home for your team's collective brain.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center pt-6">
            <button 
              onClick={() => setView(ViewState.SIGNUP)}
              className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out -skew-x-12 origin-left"></div>
              <span>Get Started Free</span>
              <svg className="inline-block w-5 h-5 ml-2 -mt-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-slate-500">No credit card required · Free 14-day trial</p>
          </div>
        </div>
      </div>
      
      {/* Value Proposition Section */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-xl border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why teams love MeetPulse</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We combine powerful AI with intuitive design to help you focus on the conversation, not the note-taking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Instant Clarity", 
                desc: "Turn hour-long recordings or rough notes into concise, readable summaries in seconds.",
                icon: (
                  <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )
              },
              { 
                title: "Action Oriented", 
                desc: "Automatically detect and list action items so everyone knows their next steps immediately.",
                icon: (
                  <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                )
              },
              { 
                title: "Secure by Design", 
                desc: "Your proprietary data is encrypted and stored securely. We prioritize your privacy above all.",
                icon: (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                )
              }
            ].map((f, i) => (
              <div key={i} className="group p-8 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-primary-500/30 transition-all duration-300">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Simple */}
      <footer className="relative z-10 py-12 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} MeetPulse Inc. All rights reserved.</p>
      </footer>
    </div>
  );

  const renderAuth = (isSignup: boolean) => (
    <div className="min-h-screen pt-16 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <PlasmaBackground />
      </div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mx-4">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={isSignup ? handleRegister : handleLogin} className="space-y-6">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => {
                setError('');
                setView(isSignup ? ViewState.LOGIN : ViewState.SIGNUP);
              }}
              className="text-primary-400 hover:text-primary-300 font-medium hover:underline"
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Notes</h1>
          <p className="text-slate-400">Manage your meetings and insights.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
             </div>
             <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:outline-none w-full md:w-64 transition-all"
             />
          </div>
          <button
            onClick={() => {
              setEditingNote(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Note
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No notes found</h3>
          <p className="text-slate-400">Get started by creating your first meeting note.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div key={note.id} className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-accent-500/10 blur-2xl rounded-full -mr-6 -mt-6"></div>

               <div className="flex justify-between items-start mb-4 relative z-10">
                 <h3 className="text-xl font-bold text-white truncate pr-4">{note.title}</h3>
                 <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingNote(note); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 rounded-md hover:bg-primary-600 transition-colors">
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 rounded-md hover:bg-red-500 transition-colors">
                      <TrashIcon />
                    </button>
                 </div>
               </div>

               <p className="text-slate-400 text-sm mb-4 line-clamp-3 h-16 leading-relaxed">
                 {note.summary || note.content || "No content..."}
               </p>

               <div className="flex flex-wrap gap-2 mb-4">
                 {note.tags.slice(0, 3).map((tag, idx) => (
                   <span key={idx} className="px-2 py-1 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-md border border-white/5">
                     #{tag}
                   </span>
                 ))}
               </div>

               <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5 mt-auto">
                 <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                 <span>{note.participants.length} Participants</span>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        initialNote={editingNote}
      />
    </div>
  );

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans selection:bg-primary-500/30">
      <Navbar user={user} setView={setView} onLogout={handleLogout} />
      
      {view === ViewState.LANDING && renderLanding()}
      {view === ViewState.LOGIN && renderAuth(false)}
      {view === ViewState.SIGNUP && renderAuth(true)}
      {view === ViewState.DASHBOARD && renderDashboard()}
    </div>
  );
};

export default App;