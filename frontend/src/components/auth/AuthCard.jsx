import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AuthCard = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [isMorphing, setIsMorphing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const toast = useToast();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Status state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Sync mode with route path when initialMode or location changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setError(null);
    setShowForgotNotice(false);

    // Trigger shape compression & pop ("masuk lalu muncul") animation
    setIsMorphing(true);
    setTimeout(() => {
      setIsMorphing(false);
    }, 280);

    setMode(newMode);
    if (newMode === 'login' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (newMode === 'register' && location.pathname !== '/register') {
      navigate('/register', { replace: true });
    }
  };

  // Submit Login (Manual Authentication)
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setShowForgotNotice(false);
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      toast.success('Selamat datang kembali!');
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Email atau kata sandi tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Register (Manual Authentication)
  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (registerPassword.length < 8) {
      setError('Kata sandi minimal harus 8 karakter.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      await register(registerName, registerEmail, registerPassword);
      toast.success('Pendaftaran berhasil! Otomatis masuk ke sistem...');
      // Automatic login after register
      await login(registerEmail, registerPassword);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-3 sm:p-5 lg:p-7 relative overflow-hidden select-none">
      {/* Background ambient warm decorative blurs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual-Panel Card: Fixed Compact 580px Height (No Scroll, 1 Clean View) */}
      <div className="relative w-full max-w-[900px] md:h-[580px] bg-white border border-[#EBE1D5] rounded-[34px] shadow-2xl shadow-orange-950/10 overflow-hidden flex flex-col md:flex-row z-10">
        {/* ========================================================= */}
        {/* LEFT PANEL: Geometric Layered Ribbon & Compact Sliding Tab */}
        {/* ========================================================= */}
        <div className="relative md:w-[36%] min-h-[140px] md:h-full bg-gradient-to-br from-[#9A3412] via-[#C2410C] to-[#EA580C] overflow-hidden flex flex-col justify-between p-5 sm:p-7 text-white shrink-0">
          {/* Layered Diagonal Ribbons (Warm orange theme) */}
          <div className="absolute -top-20 -left-20 w-[420px] h-36 -rotate-35 bg-gradient-to-r from-[#7C2D12] to-[#9A3412] shadow-2xl opacity-90 pointer-events-none" />
          <div className="absolute top-8 -left-28 w-[450px] h-32 -rotate-35 bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FB923C] shadow-xl opacity-85 pointer-events-none" />
          <div className="absolute top-44 -left-24 w-[430px] h-28 -rotate-35 bg-gradient-to-r from-[#F97316] to-[#FDBA74]/80 shadow-lg opacity-70 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-md">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-tight">
                Akademik<span className="text-amber-300">WBS</span>
              </h1>
              <p className="text-[10px] text-orange-100/80 font-medium">
                Manajemen Capstone Mahasiswa
              </p>
            </div>
          </div>

          {/* DESKTOP SWITCHER: Compact Tab Shape Tailored to Text Length */}
          <div className="hidden md:block relative z-10 my-auto -mr-7 self-end w-[114px]">
            <div className="relative h-[96px]">
              {/* The Sliding White Pill with Spring/Pop Motion ("Masuk lalu Muncul") */}
              <div
                className={`absolute -right-2 w-[114px] h-11 bg-white rounded-l-full shadow-sm transition-all duration-300 ease-out ${
                  mode === 'login' ? 'translate-y-0' : 'translate-y-[52px]'
                } ${
                  isMorphing
                    ? 'translate-x-3 scale-90 opacity-75'
                    : 'translate-x-0 scale-100 opacity-100'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.35, 0.64, 1)',
                }}
              >
                {/* Top concave fillet SVG */}
                <svg
                  className="absolute -top-3.5 right-0 w-3.5 h-3.5 text-white pointer-events-none"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M0,16 C8.837,16 16,8.837 16,0 L16,16 L0,16 Z" />
                </svg>
                {/* Bottom concave fillet SVG */}
                <svg
                  className="absolute -bottom-3.5 right-0 w-3.5 h-3.5 text-white pointer-events-none"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M0,0 C8.837,0 16,7.163 16,16 L16,0 L0,0 Z" />
                </svg>
              </div>

              {/* Tab Button 1: LOGIN */}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`relative z-10 w-full h-11 flex items-center justify-end pr-5 text-[11px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  mode === 'login'
                    ? 'text-stone-900 font-black'
                    : 'text-white/75 hover:text-white font-extrabold hover:translate-x-0.5'
                }`}
              >
                LOGIN
              </button>

              {/* Spacing gap between buttons (8px) */}
              <div className="h-2" />

              {/* Tab Button 2: DAFTAR */}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`relative z-10 w-full h-11 flex items-center justify-end pr-5 text-[11px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  mode === 'register'
                    ? 'text-stone-900 font-black'
                    : 'text-white/75 hover:text-white font-extrabold hover:translate-x-0.5'
                }`}
              >
                DAFTAR
              </button>
            </div>
          </div>

          {/* MOBILE SWITCHER: Compact Sliding Pill */}
          <div className="flex md:hidden relative z-10 mt-4 p-1 bg-black/20 rounded-full backdrop-blur-sm relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                mode === 'login' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`relative z-10 flex-1 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors duration-300 ${
                mode === 'login' ? 'text-stone-900' : 'text-white/80'
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`relative z-10 flex-1 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors duration-300 ${
                mode === 'register' ? 'text-stone-900' : 'text-white/80'
              }`}
            >
              DAFTAR
            </button>
          </div>

          {/* Bottom Academic Tagline Note */}
          <div className="relative z-10 hidden md:block pt-3 border-t border-white/15 text-[10px] text-orange-100/75 leading-relaxed">
            Dekomposisi WBS, beban kerja, dan pelacakan dependensi proyek akhir.
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: Form Area with ZERO SCROLL (1 Clean View)    */}
        {/* ========================================================= */}
        <div className="flex-1 bg-white px-6 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-7 flex flex-col justify-between overflow-hidden">
          {/* Animated Form Container: Smooth Fade & Spring Entrance */}
          <div
            key={mode}
            className={`flex-1 flex flex-col justify-between transition-all duration-300 ease-out ${
              mode === 'register'
                ? 'animate-in fade-in zoom-in-95 slide-in-from-right-3 duration-300'
                : 'animate-in fade-in zoom-in-95 slide-in-from-left-3 duration-300'
            }`}
          >
            <div>
              {/* Top Avatar Circle Badge: Clean & Compact */}
              <div className="flex flex-col items-center justify-center text-center mb-3 sm:mb-4">
                <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 p-1 shadow-md shadow-orange-500/20 ring-4 ring-orange-50 flex items-center justify-center mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center">
                    <User className="w-7 h-7 sm:w-7.5 sm:h-7.5 text-white stroke-[2.2]" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
                  {mode === 'login' ? 'LOGIN' : 'DAFTAR'}
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-400 font-medium mt-0.5">
                  {mode === 'login'
                    ? 'Masuk ke akun ruang kerja proyek akademik Anda'
                    : 'Buat akun mahasiswa baru untuk kolaborasi tim'}
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-3 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Forgot Password Notice */}
              {showForgotNotice && (
                <div className="mb-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-[11px]">
                    <span className="font-bold">Informasi Akun:</span> Silakan hubungi koordinator proyek atau dosen pembimbing untuk mereset kata sandi akun kampus Anda.
                  </div>
                </div>
              )}

              {/* ======================= */}
              {/* MODE: LOGIN FORM */}
              {/* ======================= */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5 pt-1">
                  {/* Email Field */}
                  <div className="group border-b-2 border-stone-200 focus-within:border-orange-500 transition-colors py-2 flex items-center gap-2.5">
                    <Mail className="w-4.5 h-4.5 text-stone-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email Kampus (contoh: arya@akademik.ac.id)"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="group border-b-2 border-stone-200 focus-within:border-orange-500 transition-colors py-2 flex items-center gap-2.5">
                    <Lock className="w-4.5 h-4.5 text-stone-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Kata Sandi"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                      title={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotNotice(!showForgotNotice)}
                      className="text-[11px] sm:text-xs text-stone-400 hover:text-orange-600 font-medium transition-colors cursor-pointer"
                    >
                      Lupa Kata Sandi?
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-7 py-2 sm:px-8 sm:py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{loading ? 'Memverifikasi...' : 'LOGIN'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* ======================= */
                /* MODE: REGISTER FORM (Compact Spacing, Zero Scroll) */
                /* ======================= */
                <form onSubmit={handleRegisterSubmit} className="space-y-2.5 sm:space-y-3 pt-0.5">
                  {/* Nama Lengkap */}
                  <div className="group border-b-2 border-stone-200 focus-within:border-orange-500 transition-colors py-1.5 flex items-center gap-2.5">
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Nama Lengkap Mahasiswa"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
                    />
                  </div>

                  {/* Email Kampus */}
                  <div className="group border-b-2 border-stone-200 focus-within:border-orange-500 transition-colors py-1.5 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="Email Kampus (@akademik.ac.id)"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
                    />
                  </div>

                  {/* Kata Sandi */}
                  <div className="group border-b-2 border-stone-200 focus-within:border-orange-500 transition-colors py-1.5 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Kata Sandi (Min. 8 Karakter)"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer transition-colors"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Konfirmasi Kata Sandi */}
                  <div className="group border-b-2 border-stone-200 focus-within:border-orange-500 transition-colors py-1.5 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="Ulangi Kata Sandi"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
                    />
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[11px] sm:text-xs text-stone-400 hover:text-orange-600 font-medium transition-colors cursor-pointer"
                    >
                      Sudah punya akun? <span className="font-bold underline text-stone-700">Masuk</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-7 py-2 sm:px-8 sm:py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{loading ? 'Mendaftarkan...' : 'DAFTAR'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ========================================================= */}
            {/* BOTTOM SECTION: Symmetrical Height & Clean Academic Info */}
            {/* ========================================================= */}
            <div className="mt-3 sm:mt-4 pt-3 border-t border-stone-100">
              {mode === 'login' ? (
                <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FFF9F3] border border-[#F3E2D0] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    <strong>Portal Akademik Terintegrasi:</strong> Masuk dengan akun email kampus terdaftar untuk membuka dasbor WBS, dependensi tugas, dan metrik beban kerja kelompok.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FFF9F3] border border-[#F3E2D0] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    <strong>Fleksibilitas Peran:</strong> Akun mahasiswa ini berlaku umum. Anda otomatis menjadi <strong>Leader</strong> saat membuat proyek baru, atau <strong>Member</strong> saat bergabung via kode undangan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
