import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useProjects } from '../../hooks/useProjects';
import { useStages } from '../../hooks/useStages';
import { useConvertMemoToTask } from '../../hooks/useMemos';
import { useToast } from '../../context/ToastContext';
import { Rocket, Layers, FolderKanban, Flag, Calendar } from 'lucide-react';

export const ConvertMemoModal = ({ isOpen, onClose, memo, onSuccess }) => {
  const toast = useToast();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const convertMutation = useConvertMemoToTask();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  // Fetch stages for the selected project
  const { data: stages = [], isLoading: loadingStages } = useStages(selectedProjectId);

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Auto-select first stage when stages load
  useEffect(() => {
    if (stages.length > 0) {
      setSelectedStageId(stages[0].id);
    } else {
      setSelectedStageId('');
    }
  }, [stages]);

  if (!memo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Silakan pilih proyek tujuan.');
      return;
    }
    if (!selectedStageId) {
      toast.error('Proyek ini belum memiliki tahap WBS. Silakan buat tahap WBS terlebih dahulu di proyek tersebut.');
      return;
    }

    try {
      await convertMutation.mutateAsync({
        memoId: memo.id,
        payload: {
          project_id: selectedProjectId,
          stage_id: selectedStageId,
          priority,
          due_date: dueDate || null,
        },
      });

      const targetProject = projects.find((p) => p.id === selectedProjectId);
      toast.success(
        `Catatan berhasil dikonversi menjadi tugas di proyek "${targetProject?.title || 'Proyek'}"!`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal mengonversi catatan ke tugas proyek.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jadikan Tugas Proyek (WBS)"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Memo preview summary */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Catatan yang Dikonversi:
          </div>
          <h4 className="text-xs font-bold text-stone-900 leading-snug">{memo.title}</h4>
          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
            {memo.content}
          </p>
        </div>

        {/* Project Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-orange-500" />
            <span>Pilih Ruang Proyek Tujuan <strong className="text-rose-500">*</strong></span>
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loadingProjects || projects.length === 0}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-stone-900 focus:bg-white focus:border-orange-500 outline-none transition-colors"
            required
          >
            {projects.length === 0 ? (
              <option value="">Belum ada proyek yang diikuti</option>
            ) : (
              projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.course_name} — {proj.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Stage Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            <span>Pilih Tahapan WBS <strong className="text-rose-500">*</strong></span>
          </label>
          <select
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(e.target.value)}
            disabled={loadingStages || stages.length === 0}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-stone-900 focus:bg-white focus:border-orange-500 outline-none transition-colors"
            required
          >
            {loadingStages ? (
              <option value="">Memuat tahapan WBS...</option>
            ) : stages.length === 0 ? (
              <option value="">Proyek ini belum memiliki tahap WBS</option>
            ) : (
              stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.stage_order}. {st.name}
                </option>
              ))
            )}
          </select>
          {stages.length === 0 && selectedProjectId && (
            <p className="text-[10px] text-amber-700 font-medium">
              ⚠️ Buka proyek ini terlebih dahulu untuk membuat minimal 1 tahap WBS.
            </p>
          )}
        </div>

        {/* Priority and Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-orange-500" />
              <span>Prioritas</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-stone-900 focus:bg-white focus:border-orange-500 outline-none transition-colors"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>Tenggat Waktu (Opsional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-stone-900 focus:bg-white focus:border-orange-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={convertMutation.isPending || !selectedStageId}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{convertMutation.isPending ? 'Mengonversi...' : 'Konversi Jadi Tugas'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
