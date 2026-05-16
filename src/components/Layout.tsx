import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth as firebaseAuth } from '../lib/firebase';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await firebaseAuth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex flex-col">
              <span className="text-xl font-bold text-slate-800 tracking-tight">monjurul.com <span className="text-blue-600">Sync</span></span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-none">Dual-Engine Hub</span>
            </Link>
            
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link 
                to="/" 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  window.location.pathname === '/' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <HomeIcon size={16} /> <span className="hidden sm:inline">Feed</span>
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    window.location.pathname === '/admin' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {isAdmin && (
               <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[10px] uppercase tracking-tighter">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                 Admin Access
               </div>
            )}
            
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.displayName}</p>
                    <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">{profile?.role}</p>
                  </div>
                  <img src={user.photoURL || ''} alt="" className="h-9 w-9 rounded-full ring-2 ring-white shadow-sm" />
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-xs font-bold bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pb-20">
        {children}
      </main>
      
      <footer className="fixed bottom-0 w-full px-8 py-3 bg-white/80 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between z-40 hidden sm:flex">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Database:</span>
            <span className="text-[10px] text-green-600 font-bold">READY</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Environment:</span>
            <span className="text-[10px] text-blue-600 font-bold italic uppercase tracking-tighter">Live Preview</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 italic">Securely synchronized with Cloud Firestore</div>
      </footer>
    </div>
  );
};
