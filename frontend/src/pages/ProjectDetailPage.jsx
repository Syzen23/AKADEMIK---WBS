import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '../components/layout/ProjectSidebar';
import { ProjectTopBar } from '../components/layout/ProjectTopBar';
import { RoleBadge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { WbsStageList } from '../components/wbs/WbsStageList';
import { WorkloadWidget } from '../components/dashboard/WorkloadWidget';
import { CriticalPathWidget } from '../components/dashboard/CriticalPathWidget';
import { ProjectOverview } from '../components/dashboard/ProjectOverview';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { EditTaskModal } from '../components/modals/EditTaskModal';
import { CreateStageModal } from '../components/modals/CreateStageModal';
import { EditStageModal } from '../components/modals/EditStageModal';
import { AddDependencyModal } from '../components/modals/AddDependencyModal';
import { WorkLogModal } from '../components/modals/WorkLogModal';
import { AssetModal } from '../components/modals/AssetModal';

import { useProjectDetail, useProjectMembers, useRemoveMember, useDeleteProject } from '../hooks/useProjects';
import { useStages, useDeleteStage, useApplyStageTemplate } from '../hooks/useStages';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useCreateProjectWorkLog } from '../hooks/useWorkLogs';
import { useDashboard } from '../hooks/useDashboard';
import { useAssets, useDeleteAsset } from '../hooks/useAssets';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import {
  ArrowLeft,
  Kanban,
  Layers,
  BarChart3,
  Link2,
  Users,
  Plus,
  ExternalLink,
  Trash2,
  UserMinus,
  Copy,
} from 'lucide-react';

const VALID_TABS = ['overview', 'kanban', 'wbs', 'dashboard', 'assets', 'members'];

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const toast = useToast();

  // 1. Resolusi Tab Aktif yang Persisten terhadap Refresh Browser (URL Query + LocalStorage Backup)
  const tabFromUrl = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    try {
      const savedTab = localStorage.getItem(`active_tab_${projectId}`);
      if (savedTab && VALID_TABS.includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {}
    return 'overview';
  }, [tabFromUrl, projectId]);

  const setActiveTab = useCallback(
    (nextTab) => {
      const resolvedTab = typeof nextTab === 'function' ? nextTab(activeTab) : nextTab;
      if (!VALID_TABS.includes(resolvedTab)) return;
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set('tab', resolvedTab);
          return params;
        },
        { replace: true }
      );
      try {
        localStorage.setItem(`active_tab_${projectId}`, resolvedTab);
      } catch (e) {}
    },
    [activeTab, projectId, setSearchParams]
  );

  // Sinkronisasi otomatis parameter ?tab=... di URL agar selalu eksplisit dan tahan refresh
  useEffect(() => {
    const currentParam = searchParams.get('tab');
    if (!currentParam || !VALID_TABS.includes(currentParam)) {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set('tab', activeTab);
          return params;
        },
        { replace: true }
      );
    }
  }, [searchParams, activeTab, setSearchParams]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleSetSidebarCollapsed = (val) => {
    const resolved = typeof val === 'function' ? val(isSidebarCollapsed) : val;
    setIsSidebarCollapsed(resolved);
    try {
      localStorage.setItem('sidebar_collapsed', String(resolved));
    } catch (e) {}
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskInitialStageId, setCreateTaskInitialStageId] = useState(null);
  const [createTaskInitialStatus, setCreateTaskInitialStatus] = useState('To Do');
  const [createTaskInitialDueDate, setCreateTaskInitialDueDate] = useState(null);
  const [isCreateStageOpen, setIsCreateStageOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [selectedTaskForDependency, setSelectedTaskForDependency] = useState(null);
  const [selectedTaskForWorkLog, setSelectedTaskForWorkLog] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedStageForEdit, setSelectedStageForEdit] = useState(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: true,
  });

  // Data queries
  const { data: project, isLoading: projectLoading } = useProjectDetail(projectId);
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: stages = [] } = useStages(projectId);
  const { data: tasks = [] } = useTasks(projectId);
  const { data: dashboardData } = useDashboard(projectId);
  const { data: assets = [] } = useAssets(projectId);

  // Mutations
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const deleteStage = useDeleteStage(projectId);
  const deleteAsset = useDeleteAsset(projectId);
  const removeMember = useRemoveMember(projectId);
  const deleteProject = useDeleteProject();
  const applyStageTemplate = useApplyStageTemplate(projectId);
  const quickWorkLog = useCreateProjectWorkLog(projectId);

  const handleApplyTemplate = async () => {
    try {
      await applyStageTemplate.mutateAsync();
      toast.success('Template standar Capstone (4 Tahap WBS) berhasil diterapkan!');
    } catch (err) {
      toast.error(err.message || 'Gagal menerapkan template tahapan WBS.');
    }
  };

  const handleQuickCreateTask = async ({ title, status }) => {
    if (stages.length === 0) {
      toast.error('Buat tahap WBS terlebih dahulu atau gunakan template Capstone.');
      return;
    }
    try {
      await createTask.mutateAsync({
        title,
        stage_id: stages[0].id,
        status: status || 'To Do',
        estimated_hours: 0,
        priority: 'Medium',
      });
      toast.success(`Tugas "${title}" berhasil ditambahkan!`);
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan tugas.');
    }
  };

  const handleQuickLogHours = async (taskId, hours) => {
    try {
      await quickWorkLog.mutateAsync({
        taskId,
        hours_spent: hours,
        activity_notes: `Pengerjaan tugas (+${hours} jam)`,
      });
      toast.success(`+${hours} jam kerja berhasil dicatat!`);
    } catch (err) {
      toast.error(err.message || 'Gagal mencatat jam kerja.');
    }
  };

  const handleClaimTask = async (taskId) => {
    if (!user?.id) return;
    try {
      await updateTask.mutateAsync({ taskId, data: { assigned_to: user.id } });
      toast.success('Tugas berhasil diambil oleh Anda!');
    } catch (err) {
      toast.error(err.message || 'Gagal mengambil tugas.');
    }
  };

  const myMember = members.find((m) => m.user_id === user?.id || m.id === user?.id);
  const isLeader =
    Boolean(project?.leader_id && user?.id && project.leader_id === user.id) ||
    myMember?.role === 'leader';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCopyCode = () => {
    if (!project?.invite_code) return;
    navigator.clipboard.writeText(project.invite_code);
    setCopiedCode(true);
    toast.success('Kode undangan proyek berhasil disalin!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenCreateTask = (status = 'To Do', stageId = null, dueDate = null) => {
    setCreateTaskInitialStatus(status);
    setCreateTaskInitialStageId(stageId);
    setCreateTaskInitialDueDate(dueDate);
    setIsCreateTaskOpen(true);
  };

  const handleUpdateDueDate = async (taskId, dueDate) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        data: {
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
        },
      });
      toast.success(dueDate ? 'Tenggat target hari berhasil diperbarui!' : 'Tenggat tugas dihapus.');
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui tenggat tugas.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask.mutateAsync({ taskId, data: { status: newStatus } });
      toast.success(`Status tugas diubah ke "${newStatus}"`);
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDeleteTaskConfirm = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Tugas',
      message: `Apakah Anda yakin ingin menghapus tugas "${task?.title || 'ini'}"? Tindakan ini tidak dapat dibatalkan.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteTask.mutateAsync(taskId);
          toast.success('Tugas berhasil dihapus.');
        } catch (err) {
          toast.error(err.message);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteStageConfirm = (stageId) => {
    const stage = stages.find((s) => s.id === stageId);
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Tahap WBS',
      message: `Menghapus tahap "${stage?.name || 'ini'}" akan menghapus seluruh tugas di dalamnya secara permanen. Yakin ingin melanjutkan?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteStage.mutateAsync(stageId);
          toast.success(`Tahap "${stage?.name}" berhasil dihapus.`);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteAssetConfirm = (assetId) => {
    const asset = assets.find((a) => a.id === assetId);
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Tautan Aset',
      message: `Apakah Anda yakin ingin menghapus tautan "${asset?.title || 'ini'}"?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteAsset.mutateAsync(assetId);
          toast.success('Tautan berhasil dihapus.');
        } catch (err) {
          toast.error(err.message);
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRemoveMemberConfirm = (member) => {
    setConfirmModal({
      isOpen: true,
      title: 'Keluarkan Anggota Tim',
      message: `Apakah Anda yakin ingin mengeluarkan "${member.name}" dari ruang proyek ini? Tugas yang sebelumnya ditugaskan kepadanya akan dilepas menjadi belum ditugaskan.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await removeMember.mutateAsync(member.id);
          toast.success(`Anggota "${member.name}" berhasil dikeluarkan dari proyek.`);
        } catch (err) {
          toast.error(err.message || 'Gagal mengeluarkan anggota.');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteProjectConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Ruang Proyek Ini',
      message: `PERINGATAN: Apakah Anda yakin ingin menghapus proyek "${project.title}" secara permanen? Seluruh tahapan WBS, kartu tugas, dependensi, dokumen aset, dan log jam kerja akan dihapus permanen dan TIDAK DAPAT dipulihkan.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteProject.mutateAsync(projectId);
          toast.success(`Proyek "${project.title}" berhasil dihapus.`);
          navigate('/projects');
        } catch (err) {
          toast.error(err.message || 'Gagal menghapus proyek.');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500 font-semibold">Memuat ruang kerja proyek...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-stone-800">Proyek Tidak Ditemukan</h2>
          <Link
            to="/projects"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-orange-500 text-white text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Proyek
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] text-stone-900">
      {/* 1. Left Sidebar Navigation (Admin Dashboard Style) */}
      <ProjectSidebar
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasksCount={tasks.length}
        stagesCount={stages.length}
        assetsCount={assets.length}
        membersCount={members.length}
        isLeader={isLeader}
        onOpenCreateTask={() => handleOpenCreateTask('To Do')}
        onOpenCreateStage={() => setIsCreateStageOpen(true)}
        onOpenAssetModal={() => setIsAssetModalOpen(true)}
        onCopyInviteCode={handleCopyCode}
        copiedCode={copiedCode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleSetSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        user={user}
        onLogout={handleLogout}
        onDeleteProject={handleDeleteProjectConfirm}
      />

      {/* 2. Main Visual Canvas Area (Right) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top Header Bar */}
        <ProjectTopBar
          project={project}
          activeTab={activeTab}
          isLeader={isLeader}
          onOpenCreateTask={() => handleOpenCreateTask('To Do')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onCopyInviteCode={handleCopyCode}
          copiedCode={copiedCode}
          user={user}
        />

        {/* Scrollable Visual Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Visual Content: Home / Overview Dashboard */}
            {activeTab === 'overview' && (
              <ProjectOverview
                project={project}
                stages={stages}
                tasks={tasks}
                members={members}
                assets={assets}
                dashboardData={dashboardData}
                isLeader={isLeader}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onCopyInviteCode={handleCopyCode}
                copiedCode={copiedCode}
                onOpenCreateTask={() => handleOpenCreateTask('To Do')}
                onOpenCreateTaskWithDate={(date) => handleOpenCreateTask('To Do', null, date)}
                onUpdateTaskStatus={handleStatusChange}
                onOpenCreateStage={() => setIsCreateStageOpen(true)}
                onOpenAssetModal={() => setIsAssetModalOpen(true)}
                onEditTask={(task) => setSelectedTaskForEdit(task)}
                onDeleteProject={handleDeleteProjectConfirm}
              />
            )}

            {/* Visual Content: Papan Kanban */}
            {activeTab === 'kanban' && (
              <KanbanBoard
                tasks={tasks}
                stages={stages}
                members={members}
                onUpdateStatus={handleStatusChange}
                onOpenWorkLog={(task) => setSelectedTaskForWorkLog(task)}
                onOpenAddDependency={(task) => setSelectedTaskForDependency(task)}
                onDeleteTask={handleDeleteTaskConfirm}
                onOpenCreateTask={(status) => handleOpenCreateTask(status)}
                onQuickCreateTask={handleQuickCreateTask}
                onQuickLogHours={handleQuickLogHours}
                onClaimTask={handleClaimTask}
                onUpdateDueDate={handleUpdateDueDate}
                onEditTask={(task) => setSelectedTaskForEdit(task)}
                onOpenCreateStage={() => setIsCreateStageOpen(true)}
                isLeader={isLeader}
                currentUserId={user?.id}
              />
            )}

            {/* Visual Content: Struktur WBS */}
            {activeTab === 'wbs' && (
              <WbsStageList
                stages={stages}
                tasks={tasks}
                isLeader={isLeader}
                onOpenCreateStage={() => setIsCreateStageOpen(true)}
                onOpenCreateTaskWithStage={(stageId) => handleOpenCreateTask('To Do', stageId)}
                onEditStage={(stage) => setSelectedStageForEdit(stage)}
                onEditTask={(task) => setSelectedTaskForEdit(task)}
                onDeleteStage={handleDeleteStageConfirm}
                onDeleteTask={handleDeleteTaskConfirm}
                onApplyTemplate={handleApplyTemplate}
                isApplyingTemplate={applyStageTemplate.isPending}
              />
            )}

            {/* Visual Content: Beban Kerja & Jalur Kritis */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <CriticalPathWidget criticalPath={dashboardData?.criticalPath || []} />
                <WorkloadWidget workload={dashboardData?.workload || []} />
              </div>
            )}

            {/* Visual Content: Berkas & Dokumen */}
            {activeTab === 'assets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-[#ECE0D0] shadow-xs">
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-orange-500" />
                      Tautan Berkas & Dokumen Proyek
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Repositori GitHub, prototipe Figma, dan dokumen Google Docs capstone.
                    </p>
                  </div>

                  {isLeader && (
                    <button
                      onClick={() => setIsAssetModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Tautan
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => {
                    const typeLabels = {
                      github: 'GitHub Repository',
                      figma: 'Figma UI/UX Mockup',
                      docs: 'Google Docs / SRS',
                      gdrive: 'Google Drive Folder',
                      other: 'Tautan Eksternal',
                    };

                    return (
                      <div
                        key={asset.id}
                        className="p-5 rounded-3xl bg-white border border-[#ECE0D0] hover:border-orange-300 flex flex-col justify-between shadow-xs transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                              {typeLabels[asset.asset_type] || asset.asset_type}
                            </span>
                            {isLeader && (
                              <button
                                onClick={() => handleDeleteAssetConfirm(asset.id)}
                                className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Hapus aset"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-stone-900 mb-1">{asset.title}</h4>
                          <p className="text-xs text-stone-500 font-mono truncate">{asset.asset_url}</p>
                        </div>

                        <a
                          href={asset.asset_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all cursor-pointer"
                        >
                          <span>Buka Tautan</span>
                          <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                        </a>
                      </div>
                    );
                  })}

                  {assets.length === 0 && (
                    <div className="col-span-full p-8 text-center bg-white border border-[#ECE0D0] rounded-3xl text-stone-500 text-xs font-medium">
                      Belum ada aset atau tautan dokumen yang ditambahkan.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visual Content: Anggota Tim */}
            {activeTab === 'members' && (
              <div className="bg-white border border-[#ECE0D0] rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F2E8DC]">
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      Daftar Anggota Kelompok ({members.length})
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Kelola mahasiswa yang bergabung dalam ruang proyek capstone ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Kode Disalin!' : 'Salin Kode Undangan'}</span>
                  </button>
                </div>

                <div className="divide-y divide-[#F2E8DC]">
                  {members.map((member) => {
                    const isSelf = member.id === user?.id || member.user_id === user?.id;
                    const isProjectLeader = member.role === 'leader' || member.id === project.leader_id;

                    return (
                      <div
                        key={member.id}
                        className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              member.avatar_url ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                            }
                            alt={member.name}
                            className="w-10 h-10 rounded-full ring-2 ring-orange-200 bg-orange-50 shrink-0 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-stone-900">{member.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500">{member.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <RoleBadge role={member.role} />
                          <span className="text-[11px] text-stone-500 hidden sm:inline font-medium">
                            Bergabung: {new Date(member.joined_at).toLocaleDateString('id-ID')}
                          </span>

                          {/* Leader can kick members (cannot kick self or project leader) */}
                          {isLeader && !isProjectLeader && !isSelf && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMemberConfirm(member)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                              title={`Keluarkan ${member.name} dari proyek`}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Keluarkan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals for Workspace */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setCreateTaskInitialDueDate(null);
        }}
        projectId={projectId}
        stages={stages}
        members={members}
        initialStageId={createTaskInitialStageId}
        initialStatus={createTaskInitialStatus}
        initialDueDate={createTaskInitialDueDate}
        onOpenCreateStage={() => setIsCreateStageOpen(true)}
        onApplyTemplate={handleApplyTemplate}
        isApplyingTemplate={applyStageTemplate.isPending}
      />

      <EditTaskModal
        isOpen={!!selectedTaskForEdit}
        onClose={() => setSelectedTaskForEdit(null)}
        projectId={projectId}
        task={
          selectedTaskForEdit
            ? tasks.find((t) => t.id === selectedTaskForEdit.id) || selectedTaskForEdit
            : null
        }
        stages={stages}
        members={members}
        isLeader={isLeader}
        onOpenAddDependency={(task) => {
          setSelectedTaskForEdit(null);
          setSelectedTaskForDependency(task);
        }}
        onDeleteTask={(taskId) => {
          setSelectedTaskForEdit(null);
          handleDeleteTaskConfirm(taskId);
        }}
      />

      <CreateStageModal
        isOpen={isCreateStageOpen}
        onClose={() => setIsCreateStageOpen(false)}
        projectId={projectId}
        currentStagesCount={stages.length}
      />

      <EditStageModal
        isOpen={!!selectedStageForEdit}
        onClose={() => setSelectedStageForEdit(null)}
        projectId={projectId}
        stage={selectedStageForEdit}
      />

      <AddDependencyModal
        isOpen={!!selectedTaskForDependency}
        onClose={() => setSelectedTaskForDependency(null)}
        projectId={projectId}
        task={selectedTaskForDependency}
        allTasks={tasks}
      />

      <WorkLogModal
        isOpen={!!selectedTaskForWorkLog}
        onClose={() => setSelectedTaskForWorkLog(null)}
        projectId={projectId}
        task={selectedTaskForWorkLog}
      />

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        projectId={projectId}
      />

      {/* Modern Confirmation Dialog */}
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
