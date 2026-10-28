import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, ArrowRight, Lock, Mail, Sparkles, Crown, Laptop, Cpu } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    login(demoEmail, 'password123')
      .then(() => navigate('/projects'))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft warm glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Logo */}
        <div className="inline-flex justify-center mb-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Layers className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Akademik<span className="text-orange-500">WBS</span>
        </h2>
        <p className="mt-2 text-sm text-stone-500 font-medium">
          Sistem Manajemen Capstone Berbasis WBS & Pelacakan Dependensi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-[#EFE4D6] rounded-3xl py-8 px-6 sm:px-9 shadow-xl shadow-orange-950/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Quick Demo Login Buttons */}
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF8F2] border border-[#F5E5D5]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 mb-3">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Login Cepat Akun Simulasi Mahasiswa:</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('leader@akademik.ac.id')}
                className="p-2.5 rounded-2xl bg-white hover:bg-orange-50/70 border border-[#E9DACB] hover:border-orange-300 text-stone-800 transition-all font-medium text-center shadow-2xs cursor-pointer"
              >
                <Crown className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                <span className="block font-bold text-stone-900">Arya</span>
                <span className="text-[10px] text-orange-600 font-semibold">Leader</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('budi@akademik.ac.id')}
                className="p-2.5 rounded-2xl bg-white hover:bg-orange-50/70 border border-[#E9DACB] hover:border-orange-300 text-stone-800 transition-all font-medium text-center shadow-2xs cursor-pointer"
              >
                <Laptop className="w-4 h-4 mx-auto mb-1 text-stone-600" />
                <span className="block font-bold text-stone-900">Budi</span>
                <span className="text-[10px] text-stone-500 font-medium">Frontend</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('siti@akademik.ac.id')}
                className="p-2.5 rounded-2xl bg-white hover:bg-orange-50/70 border border-[#E9DACB] hover:border-orange-300 text-stone-800 transition-all font-medium text-center shadow-2xs cursor-pointer"
              >
                <Cpu className="w-4 h-4 mx-auto mb-1 text-stone-600" />
                <span className="block font-bold text-stone-900">Siti</span>
                <span className="text-[10px] text-stone-500 font-medium">Backend</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F2E5D5]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-stone-400 font-medium">atau masuk dengan email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Email Kampus
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@akademik.ac.id"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-2xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Ruang Proyek'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500 font-medium">
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:underline">
              Daftar Mahasiswa Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
