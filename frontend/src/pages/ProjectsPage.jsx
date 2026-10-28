import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { RoleBadge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { JoinProjectModal } from '../components/modals/JoinProjectModal';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FolderKanban,
  Calendar,
  Copy,
  Check,
  Plus,
  KeyRound,
  ArrowRight,
  Sparkles,
  BookOpen,
  Trash2,
} from 'lucide-react';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: true,
  });

  const handleDeleteProjectConfirm = (proj) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Ruang Proyek',
      message: `PERINGATAN: Apakah Anda yakin ingin menghapus proyek "${proj.title}"? Seluruh tahapan WBS, kartu tugas, dependensi, dan dokumen di dalamnya akan dihapus secara permanen.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteProject.mutateAsync(proj.id);
          toast.success(`Proyek "${proj.title}" berhasil dihapus.`);
        } catch (err) {
          toast.error(err.message || 'Gagal menghapus proyek.');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCopyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar
        onOpenCreateProject={() => setIsCreateOpen(true)}
        onOpenJoinProject={() => setIsJoinOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Warm Banner (Styled like reference hero) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5EC] via-white to-[#FDF7F0] border border-[#EEDDCC] p-7 sm:p-9 mb-8 shadow-xs">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100/80 text-orange-700 border border-orange-200 mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Sistem Manajemen Proyek Akademik
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Selamat datang, <span className="text-orange-500">{user?.name}</span>!
            </h1>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed font-medium">
              Pantau tahapan WBS, hilangkan hambatan pengerjaan (*task paralysis*), dan pastikan pembagian kontribusi jam kerja kelompok transparan.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Buat Ruang Proyek Baru
              </button>

              <button
                onClick={() => setIsJoinOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-orange-700 bg-white hover:bg-orange-50 border-2 border-orange-300 transition-all cursor-pointer shadow-xs"
              >
                <KeyRound className="w-4 h-4 text-orange-500" />
                Gabung via Kode Invite
              </button>
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-orange-500" />
              Daftar Proyek Akademik ({projects.length})
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Proyek tugas akhir yang Anda kelola sebagai ketua atau ikuti sebagai anggota
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-white/60 border border-[#ECE0D0] animate-pulse"
              />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const deadlineDate = proj.deadline
                ? new Date(proj.deadline).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Belum ditentukan';

              return (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="group relative bg-white hover:bg-[#FFFCF9] border border-[#ECE0D0] hover:border-orange-300 rounded-3xl p-6 shadow-xs hover:shadow-md hover:shadow-orange-950/5 transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/90 flex items-center gap-1.5 truncate max-w-[170px]">
                        <BookOpen className="w-3.5 h-3.5 shrink-0 text-orange-500" />
                        {proj.course_name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <RoleBadge role={proj.my_role} />
                        {proj.my_role === 'leader' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProjectConfirm(proj);
                            }}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus ruang proyek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2 leading-snug">
                      {proj.title}
                    </h3>

                    {proj.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  <div>
                    {/* Invite Code row */}
                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE0D2] flex items-center justify-between text-xs mb-4">
                      <span className="text-stone-500 font-semibold text-[11px]">Kode Undangan:</span>
                      <button
                        onClick={(e) => handleCopyCode(proj.invite_code, e)}
                        className="flex items-center gap-1.5 font-mono font-bold text-orange-700 bg-white border border-orange-200 px-2.5 py-1 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs"
                        title="Salin kode invite"
                      >
                        {copiedCode === proj.invite_code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-400" />
                            <span>{proj.invite_code}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Footer info */}
                    <div className="pt-3 border-t border-[#F2E8DC] flex items-center justify-between text-xs text-stone-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{deadlineDate}</span>
                      </div>

                      <span className="text-orange-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Buka Proyek
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-[#ECE0D0] rounded-3xl shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-orange-100/70 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-200">
              <FolderKanban className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900">Belum Ada Ruang Proyek</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6 font-medium">
              Mulai dengan membuat ruang proyek capstone baru atau masukkan kode undangan dari ketua kelompok Anda.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer"
              >
                Buat Proyek Baru
              </button>
              <button
                onClick={() => setIsJoinOpen(true)}
                className="px-5 py-2.5 text-xs font-bold text-stone-700 bg-[#FAF7F2] hover:bg-[#FFF4ED] border border-[#E0D0C0] rounded-2xl cursor-pointer"
              >
                Gabung Proyek
              </button>
            </div>
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <JoinProjectModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
      />
    </div>
  );
};
