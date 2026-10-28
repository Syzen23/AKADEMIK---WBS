import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { useUpdateTask } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Calendar,
  User,
  Sparkles,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

export const EditTaskModal = ({
  isOpen,
  onClose,
  projectId,
  task,
  stages = [],
  members = [],
  isLeader = false,
  onOpenAddDependency,
  onDeleteTask,
}) => {
  const [stageId, setStageId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);

  const updateTask = useUpdateTask(projectId);
  const toast = useToast();

  const toDateKey = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStageId(task.stage_id || (stages[0]?.id || ''));
      setAssignedTo(task.assigned_to || '');
      setStatus(task.status || 'To Do');
      setPriority(task.priority || 'Medium');
      setDueDate(toDateKey(task.due_date));
      setError(null);
    }
  }, [task, isOpen, stages]);

  if (!task) return null;

  const dependencies = task.dependencies || [];
  const unfinishedDeps = dependencies.filter((dep) => dep.status !== 'Done');

  const setQuickDate = (offsetDays) => {
    if (offsetDays === null) {
      setDueDate('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDueDate(`${y}-${m}-${day}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Judul tugas tidak boleh kosong.');
      return;
    }

    if (!stageId) {
      setError('Silakan pilih tahap WBS yang valid untuk tugas ini.');
      return;
    }

    // Business rule check before marking Done
    if (status === 'Done' && unfinishedDeps.length > 0) {
      setError(
        `Tugas tidak bisa dipindahkan ke "Done". Masih ada ${unfinishedDeps.length} prasyarat yang belum selesai: ${unfinishedDeps
          .map((d) => `"${d.title}" (${d.status})`)
          .join(', ')}.`
      );
      return;
    }

    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: {
          title: title.trim(),
          description: description.trim() || null,
          stage_id: stageId,
          assigned_to: assignedTo || null,
          status,
          priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
        },
      });

      toast.success(`Detail tugas "${title.trim()}" berhasil disimpan!`);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal memperbarui tugas.');
    }
  };

  const currentStage = stages.find((s) => s.id === stageId) || { name: task.stage_name };
  const currentAssignee = members.find((m) => (m.user_id || m.id) === assignedTo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail & Konteks Tugas"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Quick Context Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EDE0D2]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
              <Layers className="w-3 h-3 text-orange-600" />
              <span>{currentStage?.name || 'Tahap WBS'}</span>
            </span>
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>

          {currentAssignee && (
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className="text-[11px] text-stone-400">PJ:</span>
              <img
                src={
                  currentAssignee.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentAssignee.name}`
                }
                alt={currentAssignee.name}
                className="w-5 h-5 rounded-full ring-1 ring-orange-200 object-cover"
              />
              <span className="font-semibold text-stone-800 text-xs">{currentAssignee.name}</span>
            </div>
          )}
        </div>

        {/* 1. Judul Tugas */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Judul Tugas *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Susun Bab 1 Pendahuluan & Latar Belakang"
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm font-bold focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400 placeholder:font-normal"
          />
        </div>

        {/* 2. Textarea: Konteks & Catatan Pengerjaan (Tepat di Bawah Judul!) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>Konteks & Detail Instruksi Tugas (Deskripsi)</span>
            </label>
            <span className="text-[11px] text-stone-400 font-medium">Bisa isi checklist & link</span>
          </div>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Tuliskan konteks lengkap apa yang harus dikerjakan di sini...\nContoh:\n• Cakupan: rumusan masalah 3 poin & tujuan penelitian\n• Deliverable: file Google Docs sesuai format panduan capstone\n• Tautan draft dokumen: https://docs.google.com/...`}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-xs sm:text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400 font-normal leading-relaxed resize-y"
          />

          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-stone-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Konteks yang jelas membantu anggota tim menghindari kebingungan (task paralysis) dan langsung fokus eksekusi.</span>
          </div>
        </div>

        {/* 3. Grid Form: Tahap WBS & Pelaksana */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tahap WBS (Phase) *
            </label>
            <select
              required
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-xs font-medium focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              {stages.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {stg.stage_order}. {stg.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Pelaksana Utama (Assignee)
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-xs font-medium focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="">-- Belum Ditugaskan --</option>
              {members.map((m) => {
                const uid = m.user_id || m.id;
                return (
                  <option key={uid} value={uid}>
                    {m.name} ({m.role})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* 4. Grid Form: Status & Prioritas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Status Papan Kanban
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-xs font-medium focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="To Do">Belum Dimulai (To Do)</option>
              <option value="In Progress">Sedang Dikerjakan (In Progress)</option>
              <option value="Blocked">Terkendala / Terkunci (Blocked)</option>
              <option value="Done">Selesai (Done)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tingkat Prioritas
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-xs font-medium focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="Low">Low (Rendah)</option>
              <option value="Medium">Medium (Sedang)</option>
              <option value="High">High (Tinggi)</option>
              <option value="Critical">Critical (Sangat Mendesak)</option>
            </select>
          </div>
        </div>

        {/* 5. Target Tenggat Hari (Due Date) */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>Target Tenggat Hari (Due Date)</span>
            </label>
            {dueDate && (
              <button
                type="button"
                onClick={() => setQuickDate(null)}
                className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold cursor-pointer"
              >
                Hapus Tenggat
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 border border-orange-200 transition-colors cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 border border-orange-200 transition-colors cursor-pointer"
            >
              Besok
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(3)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-white hover:bg-orange-500 hover:text-white text-stone-700 border border-[#E5D7C7] transition-colors cursor-pointer"
            >
              +3 Hari
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-white hover:bg-orange-500 hover:text-white text-stone-700 border border-[#E5D7C7] transition-colors cursor-pointer"
            >
              +1 Minggu
            </button>
          </div>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5D7C7] text-stone-900 text-xs focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-medium"
          />
        </div>

        {/* 6. Prasyarat & Dependensi */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DACB]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Ketergantungan Prasyarat (Dependencies)</span>
            </div>
            {isLeader && onOpenAddDependency && (
              <button
                type="button"
                onClick={() => onOpenAddDependency(task)}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
              >
                Kelola Prasyarat
              </button>
            )}
          </div>

          {dependencies.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                {dependencies.map((dep) => (
                  <span
                    key={dep.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border ${
                      dep.status === 'Done'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                    }`}
                  >
                    {dep.status === 'Done' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Lock className="w-3 h-3 text-amber-600" />
                    )}
                    <span>{dep.title}</span>
                    <span className="text-[10px] opacity-75">({dep.status})</span>
                  </span>
                ))}
              </div>

              {unfinishedDeps.length > 0 && (
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  🔒 Tugas ini belum dapat dipindahkan ke "Done" sebelum {unfinishedDeps.length} prasyarat di atas selesai.
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Tugas independen (tidak memiliki prasyarat).</span>
              {isLeader && onOpenAddDependency && (
                <button
                  type="button"
                  onClick={() => onOpenAddDependency(task)}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
                >
                  + Tambah Prasyarat
                </button>
              )}
            </div>
          )}
        </div>

        {/* 7. Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0E5D7]">
          <div>
            {isLeader && onDeleteTask && (
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tugas</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updateTask.isPending}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {updateTask.isPending ? 'Menyimpan...' : 'Simpan Detail Tugas'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
