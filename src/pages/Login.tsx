import React from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      console.log("🔥 Login button clicked");

      const res = await signInWithGoogle();

      console.log("✅ Firebase login success:", res.user);

      // ⚠️ এখানে navigate delay দিচ্ছি যাতে AuthContext backend call করতে পারে
      setTimeout(() => {
        navigate('/');
      }, 500);

    } catch (error) {
      console.error('❌ Login failed', error);
      alert("Login failed! Check console.");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-[3rem] p-12 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]"
      >
        <div className="mb-10">
          <div className="h-20 w-20 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl font-black mb-6 shadow-xl shadow-blue-500/30">
            M
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
            monjurul<span className="text-blue-600 italic">.com</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
            Synchronized Content Hub
          </p>
        </div>

        <div className="space-y-4 mb-10 text-left">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold italic">1</div>
            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">
              Real-time Admin-User Sync
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold italic">2</div>
            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">
              Google OAuth 2.0 Terminal
            </p>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-5 px-6 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10"
        >
          <LogIn size={20} />
          Sign in via Google
        </button>

        <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
          Security Verified by Firestore Protocol
        </p>
      </motion.div>
    </div>
  );
};

export default Login;