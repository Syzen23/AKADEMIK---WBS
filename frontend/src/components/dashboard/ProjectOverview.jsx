import React, { useMemo } from 'react';
import { RoleBadge, StatusBadge } from '../ui/Badge';
import { ProjectCalendarCanvas } from './ProjectCalendarCanvas';
import {
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  Plus,
  TrendingUp,
  Flag,
  Trash2,
} from 'lucide-react';

const toDateKey = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ProjectOverview = ({
  project,
  stages = [],
  tasks = [],
  members = [],
  assets = [],
  dashboardData,
  isLeader = false,
  onNavigateTab,
  onCopyInviteCode,
  copiedCode = false,
  onOpenCreateTask,
  onOpenCreateTaskWithDate,
  onOpenCreateStage,
  onOpenAssetModal,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteProject,
}) => {
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  // Calculations
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Project Deadline text and countdown
  const deadlineFormatted = project?.deadline
    ? new Date(project.deadline).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Belum ditentukan';

  const projectRemainingDays = useMemo(() => {
    if (!project?.deadline) return null;
    const d1 = new Date(todayKey);
    const d2 = new Date(toDateKey(project.deadline));
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hari Ini';
    if (diff === 1) return 'Besok';
    if (diff > 1) return `Sisa ${diff} Hari Lagi`;
    return `Lewat ${Math.abs(diff)} Hari`;
  }, [project?.deadline, todayKey]);

  // Active tasks due within 7 days or overdue
  const activeUrgentTasksCount = useMemo(() => {
    const now = new Date(todayKey);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    return tasks.filter((t) => {
      if (t.status === 'Done' || !t.due_date) return false;
      const tDate = new Date(toDateKey(t.due_date));
      return tDate <= in7Days;
    }).length;
  }, [tasks, todayKey]);

  const criticalTasks = dashboardData?.criticalPath || [];

  return (
    <div className="space-y-6">
      {/* 1. Project Hero Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FFF9F3] to-[#FAF7F2] border border-[#ECE0D0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                {project.course_name}
              </span>
              <RoleBadge role={isLeader ? 'leader' : 'member'} />
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                Tenggat Proyek: <strong className="text-stone-900">{deadlineFormatted}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
              {project.title}
            </h1>

            {project.description && (
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                {project.description}
              </p>
            )}

            {/* Quick Action buttons for leader */}
            {isLeader && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onOpenCreateTask}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tugas Baru</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCreateStage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-orange-600 bg-white hover:bg-orange-50/60 border border-[#E8DACB] rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tambah Tahap WBS</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAssetModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-orange-600 bg-white hover:bg-orange-50/60 border border-[#E8DACB] rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tautkan Dokumen / Aset</span>
                </button>
                {onDeleteProject && (
                  <button
                    type="button"
                    onClick={onDeleteProject}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all cursor-pointer sm:ml-auto"
                    title="Hapus ruang proyek ini secara permanen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Proyek</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Invite Code Capsule Box */}
          <div className="shrink-0 p-5 rounded-2xl bg-white border border-[#E8DACB] shadow-2xs space-y-3 min-w-[220px]">
            <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Kode Undangan Tim
              </div>
              <div className="font-mono text-base font-extrabold text-orange-700 mt-0.5 tracking-wider">
                {project.invite_code}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-tight">
                Bagikan kode ini kepada rekan tim untuk bergabung ke ruang proyek.
              </p>
            </div>

            <button
              type="button"
              onClick={onCopyInviteCode}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200 text-orange-800 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Kode Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-orange-600" />
                  <span>Salin Kode Undangan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Target-Based Metrics Row (Clean UX - No Clutter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Progress */}
        <div className="p-5 rounded-3xl bg-white border border-[#ECE0D0] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-stone-500">Progres Capstone</span>
            <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900">{progressPercent}%</div>
          <div className="w-full bg-[#F2E8DC] rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-stone-500 mt-2 font-medium">
            {doneTasks} dari {totalTasks} tugas selesai
          </div>
        </div>

        {/* Metric 2: Project Deadline Target */}
        <div className="p-5 rounded-3xl bg-white border border-[#ECE0D0] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-stone-500">Tenggat Proyek</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-stone-900 truncate">
            {project?.deadline ? (
              new Date(project.deadline).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            ) : (
              'Belum diatur'
            )}
          </div>
          <div className="text-[11px] font-bold mt-2 flex items-center gap-1.5 text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{projectRemainingDays || 'Atur tenggat di proyek'}</span>
          </div>
        </div>

        {/* Metric 3: Urgent Targets (Within 7 Days) */}
        <div className="p-5 rounded-3xl bg-white border border-[#ECE0D0] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-stone-500">Target Mendekati Tenggat</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900">{activeUrgentTasksCount} Target</div>
          <div className="text-[11px] text-stone-500 mt-2 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Tenggat dalam 7 hari ke depan</span>
          </div>
        </div>

        {/* Metric 4: Team & Stages */}
        <div className="p-5 rounded-3xl bg-white border border-[#ECE0D0] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-stone-500">Tahap & Anggota</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-stone-900">{stages.length} Tahap WBS</div>
          <div className="text-[11px] text-stone-500 mt-2 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>{members.length} Anggota tim aktif</span>
          </div>
        </div>
      </div>

      {/* 3. CENTERPIECE: Canvas Kalender & Target Progres */}
      <ProjectCalendarCanvas
        project={project}
        tasks={tasks}
        stages={stages}
        isLeader={isLeader}
        onOpenCreateTaskWithDate={onOpenCreateTaskWithDate}
        onUpdateTaskStatus={onUpdateTaskStatus}
        onEditTask={onEditTask}
      />

      {/* 4. Dual Section: Stages Progress Breakdown & Critical Path Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Stages Breakdown Preview */}
        <div className="bg-white border border-[#ECE0D0] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#F2E8DC]">
            <div className="flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-orange-500" />
              <h3 className="text-sm font-bold text-stone-900">
                Progres Tahapan WBS ({stages.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('wbs')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Selengkapnya</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {stages.map((stage) => {
              const stageTasks = tasks.filter((t) => t.stage_id === stage.id);
              const done = stageTasks.filter((t) => t.status === 'Done').length;
              const percent =
                stageTasks.length > 0 ? Math.round((done / stageTasks.length) * 100) : 0;

              return (
                <div
                  key={stage.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#ECE0D0] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-stone-900">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-[11px] shrink-0">
                        {stage.stage_order}
                      </span>
                      <span>{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-stone-600 text-[11px]">
                      <span>{stageTasks.length} Tugas ({done} selesai)</span>
                      <span className="text-emerald-700 font-bold">{percent}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#EADCCB] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {stages.length === 0 && (
              <div className="py-6 text-center text-xs text-stone-400">
                Belum ada tahap WBS yang dibuat.{' '}
                {isLeader && (
                  <button
                    type="button"
                    onClick={onOpenCreateStage}
                    className="text-orange-600 font-bold underline ml-1 cursor-pointer"
                  >
                    Buat tahap pertama
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Critical Path Tasks Snapshot */}
        <div className="bg-white border border-[#ECE0D0] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#F2E8DC]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="text-sm font-bold text-stone-900">
                Jalur Kritis Capstone (Critical Path)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Dasbor Lengkap</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {criticalTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <h5 className="font-bold text-stone-900 truncate">{task.title}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>{task.stage_name}</span>
                      <span>•</span>
                      <span>
                        {task.assigned_to_name
                          ? task.assigned_to_name.split(' ')[0]
                          : 'Belum ada pelaksana'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={task.status} />
                  {task.due_date && (
                    <span className="font-semibold text-stone-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                      {new Date(task.due_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {criticalTasks.length === 0 && (
              <div className="py-6 text-center text-xs text-stone-500">
                Tidak ada tugas jalur kritis yang mendesak saat ini. Semua tugas jalur kritis telah selesai atau belum memiliki prasyarat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

