import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useCreateTask } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, AlertCircle, Clock } from 'lucide-react';

export const CreateTaskModal = ({
  isOpen,
  onClose,
  projectId,
  stages = [],
  members = [],
  initialStageId,
  initialStatus = 'To Do',
  initialDueDate = '',
  onOpenCreateStage,
  onApplyTemplate,
  isApplyingTemplate = false,
}) => {
  const [stageId, setStageId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('2.0');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);

  const createTask = useCreateTask(projectId);
  const toast = useToast();

  // Helper for quick date selection
  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDueDate(`${y}-${m}-${day}`);
  };

  // Keep stageId strictly valid whenever stages change or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialStageId && stages.some((s) => s.id === initialStageId)) {
        setStageId(initialStageId);
      } else if (stages.length > 0) {
        if (!stageId || !stages.some((s) => s.id === stageId)) {
          setStageId(stages[0].id);
        }
      } else {
        setStageId('');
      }
      if (initialDueDate) {
        setDueDate(initialDueDate);
      }
      setError(null);
    }
  }, [isOpen, initialStageId, initialDueDate, stages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!stageId) {
      setError('Silakan pilih tahap WBS yang valid untuk tugas ini.');
      return;
    }

    try {
      await createTask.mutateAsync({
        stage_id: stageId,
        assigned_to: assignedTo || null,
        title: title.trim(),
        description: description.trim() || null,
        estimated_hours: parseFloat(estimatedHours) || 0,
        status: initialStatus,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });

      toast.success(`Tugas "${title}" berhasil ditambahkan!`);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const hourPresets = ['2.0', '4.0', '8.0', '16.0', '24.0'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Tugas Baru (WBS Task)">
      {/* If project has NO stages yet, show clear UX guidance */}
      {stages.length === 0 ? (
        <div className="py-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">Belum Ada Tahapan WBS</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Tugas dalam sistem WBS harus dikelompokkan ke dalam tahap kerja (misal: <em>1. Analisis</em>, <em>2. Desain</em>, atau <em>3. Implementasi</em>).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {onApplyTemplate && (
              <button
                type="button"
                onClick={onApplyTemplate}
                disabled={isApplyingTemplate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 cursor-pointer transition-all disabled:opacity-50"
              >
                <Layers className="w-4 h-4" />
                <span>{isApplyingTemplate ? 'Menerapkan...' : '⚡ Gunakan Template Standar Capstone (4 Tahap)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCreateStage) onOpenCreateStage();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-700 hover:text-orange-600 bg-[#FAF7F2] border border-[#E8DACB] cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-orange-500" />
              <span>Buat Tahap Manual</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tahap WBS (Stage) *
            </label>
            <select
              required
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer font-medium"
            >
              {stages.map((st) => (
                <option key={st.id} value={st.id} className="bg-white text-stone-900">
                  {st.stage_order}. {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Judul Tugas *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Slicing UI Komponen Kanban Board"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Deskripsi Pekerjaan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian teknis yang harus dikerjakan..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Penerima Tugas (Assignee)
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer font-medium"
              >
                <option value="" className="bg-white text-stone-400">Pilih Anggota Tim...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white text-stone-900">
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer font-medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Jalur Kritis)</option>
              </select>
            </div>
          </div>

          {/* Target Tenggat Hari (Priority Field for Students) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Target Tenggat Waktu (Due Date)
              </label>
              <span className="text-[10px] text-stone-400 font-semibold">Pilih Cepat Hari:</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full sm:flex-1 px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-semibold"
              />
              <div className="grid grid-cols-4 sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="px-2 py-1.5 rounded-xl text-center text-xs font-bold bg-[#F4ECE2] hover:bg-orange-500 hover:text-white text-stone-700 transition-all cursor-pointer"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="px-2 py-1.5 rounded-xl text-center text-xs font-bold bg-[#F4ECE2] hover:bg-orange-500 hover:text-white text-stone-700 transition-all cursor-pointer"
                >
                  Besok
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(3)}
                  className="px-2 py-1.5 rounded-xl text-center text-xs font-bold bg-[#F4ECE2] hover:bg-orange-500 hover:text-white text-stone-700 transition-all cursor-pointer"
                >
                  +3 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(7)}
                  className="px-2 py-1.5 rounded-xl text-center text-xs font-bold bg-[#F4ECE2] hover:bg-orange-500 hover:text-white text-stone-700 transition-all cursor-pointer"
                >
                  +1 Mgg
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F2E5D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 rounded-2xl hover:bg-stone-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {createTask.isPending ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
