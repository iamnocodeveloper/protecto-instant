import React, { useState } from 'react';
import { db } from '../store/AppContext';
import { Coffee, Mail, CheckCircle, Loader2 } from 'lucide-react';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(email);
    } catch (err: any) {
      setError(err.body?.message || 'Error sending code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err: any) {
      setError(err.body?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  if (!sentEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <form onSubmit={sendCode} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm">
          <div className="flex justify-center mb-6 text-indigo-600">
            <Coffee size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-center mb-6 text-sm">Enter your email to sign in to the POS</p>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 flex justify-center items-center disabled:opacity-70 transition-colors"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Code'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <form onSubmit={verifyCode} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm">
        <div className="flex justify-center mb-6 text-green-500">
          <CheckCircle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Check Your Email</h2>
        <p className="text-slate-500 text-center mb-6 text-sm">We sent a verification code to <strong className="text-slate-700">{sentEmail}</strong></p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full px-4 py-2 text-center text-xl tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            required
            autoFocus
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 flex justify-center items-center disabled:opacity-70 transition-colors"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Sign In'}
        </button>
        
        <button 
          type="button" 
          onClick={() => {setSentEmail(''); setCode(''); setError('');}}
          className="w-full mt-4 text-slate-500 text-sm hover:text-slate-700"
        >
          Use a different email
        </button>
      </form>
    </div>
  );
};
