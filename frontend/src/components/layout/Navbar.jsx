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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#F2E5D5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link to="/projects" className="flex items-center gap-3.5 group cursor-pointer">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-stone-900 tracking-tight">
                Akademik<span className="text-orange-500">WBS</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100/70 text-orange-700 border border-orange-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-stone-500 -mt-0.5">Sistem Manajemen Capstone & WBS</p>
          </div>
        </Link>

        {/* Action Controls & User */}
        <div className="flex items-center gap-3">
          {onOpenJoinProject && (
            <button
              onClick={onOpenJoinProject}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-orange-600 bg-[#FAF7F2] hover:bg-[#FFF4ED] border border-[#E8DACB] rounded-2xl transition-all cursor-pointer shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-orange-500" />
              <span>Gabung Proyek</span>
            </button>
          )}

          {onOpenCreateProject && (
            <button
              onClick={onOpenCreateProject}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Proyek Baru</span>
            </button>
          )}

          {/* User profile capsule */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-[#F0E4D6]">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-orange-200 bg-orange-50"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-stone-800">{user.name}</div>
                  <div className="text-[10px] text-stone-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar akun"
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
