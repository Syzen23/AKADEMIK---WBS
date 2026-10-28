import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Layers, Plus, KeyRound } from 'lucide-react';

export const Navbar = ({ onOpenCreateProject, onOpenJoinProject }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#F2E5D5] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link to="/projects" className="flex items-center gap-2 sm:gap-3.5 group cursor-pointer min-w-0 shrink">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-stone-900 tracking-tight truncate">
                Akademik<span className="text-orange-500">WBS</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100/70 text-orange-700 border border-orange-200">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-stone-500 -mt-0.5 truncate">
              Sistem Manajemen Capstone & WBS
            </p>
          </div>
        </Link>

        {/* Action Controls & User */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onOpenJoinProject && (
            <button
              onClick={onOpenJoinProject}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-stone-700 hover:text-orange-600 bg-[#FAF7F2] hover:bg-[#FFF4ED] border border-[#E8DACB] rounded-2xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
              title="Gabung Proyek via Kode"
            >
              <KeyRound className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="hidden sm:inline">Gabung Proyek</span>
            </button>
          )}

          {onOpenCreateProject && (
            <button
              onClick={onOpenCreateProject}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap"
              title="Buat Ruang Proyek Baru"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Proyek Baru</span>
            </button>
          )}

          {/* User profile capsule */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-3 border-l border-[#F0E4D6] shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-orange-200 bg-orange-50 shrink-0"
                  title={user.name}
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-stone-800 truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-stone-500 truncate max-w-[120px]">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar akun"
                className="p-1.5 sm:p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
