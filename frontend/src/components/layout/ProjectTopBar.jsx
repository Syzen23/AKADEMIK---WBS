import React from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Copy,
  Check,
  Calendar,
  Layers,
  Kanban,
  BarChart3,
  Link2,
  Users,
  LayoutDashboard,
} from 'lucide-react';

export const ProjectTopBar = ({
  project,
  activeTab,
  isLeader = false,
  onOpenCreateTask,
  onToggleMobileSidebar,
  onCopyInviteCode,
  copiedCode = false,
  user,
}) => {
  const tabMeta = {
    overview: {
      title: 'Home / Overview Proyek',
      description: 'Ringkasan kemajuan capstone, jadwal, dan status seluruh fitur.',
      icon: LayoutDashboard,
    },
    kanban: {
      title: 'Papan Kanban',
      description: 'Pantau dan geser progres tugas melalui kolom visual terukur.',
      icon: Kanban,
    },
    wbs: {
      title: 'Hierarki Struktur WBS',
      description: 'Dekomposisi tahapan capstone, estimasi jam kerja, dan prasyarat.',
      icon: Layers,
    },
    dashboard: {
      title: 'Dasbor Beban Kerja & Jalur Kritis',
      description: 'Pantau 3 tugas kritis penentu kelulusan dan distribusi jam kerja anggota.',
      icon: BarChart3,
    },
    assets: {
      title: 'Tautan Berkas & Dokumen',
      description: 'Akses cepat repositori GitHub, prototipe Figma, dan Google Docs.',
      icon: Link2,
    },
    members: {
      title: 'Anggota Tim Kelompok',
      description: 'Daftar mahasiswa yang bergabung dalam ruang kerja proyek ini.',
      icon: Users,
    },
  };

  const currentTab = tabMeta[activeTab] || tabMeta.kanban;
  const TabIcon = currentTab.icon;

  const deadlineFormatted = project?.deadline
    ? new Date(project.deadline).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2 sm:py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hamburger (mobile) + Breadcrumbs & Page Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
            title="Buka Menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          <div className="min-w-0">
            {/* Breadcrumb row: Proyek / Course / Project Title */}
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-semibold truncate mb-0.5">
              <Link to="/projects" className="hover:text-orange-600 transition-colors">
                Proyek
              </Link>
              <span>/</span>
              <span className="text-stone-700 font-bold truncate">
                {project?.course_name || 'Matakuliah'}
              </span>
              <span>/</span>
              <span className="text-stone-500 font-medium truncate max-w-[120px] sm:max-w-[200px]" title={project?.title}>
                {project?.title || 'Ruang Proyek'}
              </span>
            </div>

            {/* Active view title */}
            <div className="flex items-center gap-1.5">
              <TabIcon className="w-4 h-4 text-orange-500 shrink-0" />
              <h1 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight truncate">
                {currentTab.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Quick Context Badges & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Invite Code Quick Copy */}
          {project?.invite_code && (
            <button
              onClick={onCopyInviteCode}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 text-[11px] font-semibold text-stone-700 transition-all cursor-pointer"
              title="Salin kode undangan"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold text-[10px]">Kode Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-stone-500" />
                  <span className="text-[10px]">
                    Kode: <strong className="font-mono text-orange-700">{project.invite_code}</strong>
                  </span>
                </>
              )}
            </button>
          )}

          {/* Deadline Badge */}
          {deadlineFormatted && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-stone-600 font-semibold">
              <Calendar className="w-3 h-3 text-orange-500" />
              <span>
                Tenggat: <strong className="text-stone-800">{deadlineFormatted}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
