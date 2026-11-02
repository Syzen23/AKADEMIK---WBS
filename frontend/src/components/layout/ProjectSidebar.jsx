import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  Layers,
  BarChart3,
  Link2,
  Users,
  Plus,
  ArrowLeft,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';

export const ProjectSidebar = ({
  project,
  activeTab,
  setActiveTab,
  tasksCount = 0,
  stagesCount = 0,
  assetsCount = 0,
  membersCount = 0,
  isLeader = false,
  onOpenCreateTask,
  onOpenCreateStage,
  onOpenAssetModal,
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
  user,
  onLogout,
  onDeleteProject,
}) => {
  const primaryMenuItems = [
    {
      id: 'overview',
      label: 'Home / Overview',
      description: 'Ringkasan & status seluruh fitur',
      icon: LayoutDashboard,
    },
    {
      id: 'kanban',
      label: 'Papan Kanban',
      description: 'Alur kerja visual tugas',
      icon: Kanban,
      count: tasksCount,
    },
    {
      id: 'wbs',
      label: 'Struktur WBS',
      description: 'Hierarki dekomposisi tahap',
      icon: Layers,
      count: stagesCount,
    },
    {
      id: 'assets',
      label: 'Berkas & Dokumen',
      description: 'GitHub, Figma, tautan docs',
      icon: Link2,
      count: assetsCount,
    },
  ];

  const secondaryMenuItems = [
    {
      id: 'dashboard',
      label: 'Beban Kerja & Kritis',
      description: 'Jalur kritis & jam kerja',
      icon: BarChart3,
      badge: 'Live',
    },
    {
      id: 'members',
      label: 'Anggota Tim',
      description: 'Daftar & peran kelompok',
      icon: Users,
      count: membersCount,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#ECE0D0] transition-all duration-300 ease-in-out lg:static ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-18' : 'w-60 sm:w-64'}`}
      >
        {/* Brand & App Title Header */}
        <div
          className={`h-14 sm:h-15 flex items-center border-b border-[#F2E5D5] bg-[#FAF7F2]/40 shrink-0 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {isCollapsed ? (
            /* Collapsed Header: Centered Interactive Logo to Expand */
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 hover:scale-105 transition-all cursor-pointer group"
              title="Klik untuk memperluas sidebar"
            >
              <Layers className="w-4.5 h-4.5 text-white group-hover:hidden transition-all" />
              <ChevronRight className="w-4.5 h-4.5 text-white hidden group-hover:block transition-all" />
            </button>
          ) : (
            /* Expanded Header: Brand + Collapse Button */
            <>
              <Link
                to="/projects"
                className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-stone-900 tracking-tight">
                      Akademik<span className="text-orange-500">WBS</span>
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-700">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-medium truncate">
                    Workspace Proyek
                  </p>
                </div>
              </Link>

              {/* Desktop Collapse Toggle */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DACB] transition-colors cursor-pointer"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Scrollable Center Content: Navigation & Actions */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Workspace Identifier (Only in Expanded Mode) */}
            {!isCollapsed && (
              <div className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#ECE0D0] flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider truncate">
                    {project?.course_name || 'Matakuliah'}
                  </div>
                  <div className="text-xs font-bold text-stone-900 truncate" title={project?.title}>
                    {project?.title}
                  </div>
                </div>
              </div>
            )}

            {/* 1. MENU UTAMA */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2 pb-0.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  Menu Utama
                </div>
              )}

              <nav className="space-y-0.5">
                {primaryMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (setIsMobileOpen) setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl transition-all cursor-pointer ${
                        isCollapsed ? 'p-2 justify-center' : 'px-2.5 py-1.5'
                      } ${
                        active
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F2] font-semibold'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-white' : 'text-stone-500'
                          }`}
                        />
                        {!isCollapsed && (
                          <div className="text-left truncate">
                            <div className="text-xs leading-none">{item.label}</div>
                          </div>
                        )}
                      </div>

                      {!isCollapsed && item.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                            active
                              ? 'bg-orange-600 text-white'
                              : 'bg-[#F2E8DC] text-stone-700'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 2. TIM & ANALISIS */}
            <div className="space-y-0.5 pt-1.5 border-t border-[#F2E8DC]">
              {!isCollapsed && (
                <div className="px-2 pb-0.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  Tim & Analisis
                </div>
              )}

              <nav className="space-y-0.5">
                {secondaryMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (setIsMobileOpen) setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl transition-all cursor-pointer ${
                        isCollapsed ? 'p-2 justify-center' : 'px-2.5 py-1.5'
                      } ${
                        active
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F2] font-semibold'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-white' : 'text-stone-500'
                          }`}
                        />
                        {!isCollapsed && (
                          <div className="text-left truncate">
                            <div className="text-xs leading-none">{item.label}</div>
                          </div>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div>
                          {item.count !== undefined && (
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                                active
                              ? 'bg-orange-600 text-white'
                              : 'bg-[#F2E8DC] text-stone-700'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase ${
                                active
                              ? 'bg-orange-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 3. AKSI CEPAT (Only leader) */}
          {isLeader && (
            <div
              className={`pt-2 border-t border-[#F2E5D5] space-y-1.5 ${
                isCollapsed ? 'flex flex-col items-center' : ''
              }`}
            >
              {!isCollapsed && (
                <div className="px-2 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  Aksi Cepat
                </div>
              )}

              {/* Tambah Tugas Baru */}
              <button
                type="button"
                onClick={() => {
                  onOpenCreateTask();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer ${
                  isCollapsed
                    ? 'w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white'
                    : 'w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                }`}
                title="Tambah Tugas Baru"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>Tambah Tugas Baru</span>}
              </button>

              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCreateStage();
                      if (setIsMobileOpen) setIsMobileOpen(false);
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:text-orange-600 bg-[#FAF7F2] hover:bg-[#FFF4ED] border border-[#E5D7C7] rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-orange-500" />
                    <span>Tahap WBS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenAssetModal();
                      if (setIsMobileOpen) setIsMobileOpen(false);
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:text-orange-600 bg-[#FAF7F2] hover:bg-[#FFF4ED] border border-[#E5D7C7] rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-orange-500" />
                    <span>Tautkan Aset</span>
                  </button>
                </div>
              )}

              {/* Hapus Proyek Option for Leader */}
              {onDeleteProject && (
                <button
                  type="button"
                  onClick={() => {
                    if (setIsMobileOpen) setIsMobileOpen(false);
                    onDeleteProject();
                  }}
                  className={`flex items-center justify-center gap-1 rounded-lg font-semibold text-[10px] text-rose-600 hover:text-white bg-rose-50/70 hover:bg-rose-600 border border-rose-200/80 hover:border-rose-600 transition-all cursor-pointer ${
                    isCollapsed ? 'w-9 h-7 p-1' : 'w-full px-2 py-1'
                  }`}
                  title="Hapus ruang proyek ini secara permanen"
                >
                  <Trash2 className="w-3 h-3 shrink-0" />
                  {!isCollapsed && <span>Hapus Ruang Proyek</span>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Bottom Footer (Profile & Back & Collapse Toggle) */}
        <div className="p-2 sm:p-2.5 border-t border-[#F2E5D5] bg-[#FAF7F2]/50 shrink-0 space-y-1">
          {/* Back to Projects List */}
          <Link
            to="/projects"
            className={`flex items-center gap-2 rounded-xl text-stone-600 hover:text-orange-600 hover:bg-white border border-transparent hover:border-[#E8DACB] transition-all cursor-pointer font-bold text-xs ${
              isCollapsed ? 'p-1.5 justify-center' : 'px-2.5 py-1.5'
            }`}
            title="Kembali ke Semua Proyek"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0 text-stone-500" />
            {!isCollapsed && <span>Semua Proyek</span>}
          </Link>

          {/* User Profile Capsule */}
          <div
            className={`flex items-center justify-between p-1 rounded-xl bg-white border border-[#ECE0D0] ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <img
                src={
                  user?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`
                }
                alt={user?.name || 'User'}
                className="w-6 h-6 rounded-full ring-2 ring-orange-200 bg-orange-50 shrink-0"
              />
              {!isCollapsed && (
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[9px] text-stone-500 truncate">
                    {user?.email}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Keluar Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dedicated Expand / Collapse Toggle Button for Desktop */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center gap-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer text-xs font-semibold w-full py-0.5`}
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-stone-500">
                <ChevronLeft className="w-3 h-3" />
                <span>Ciutkan Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
