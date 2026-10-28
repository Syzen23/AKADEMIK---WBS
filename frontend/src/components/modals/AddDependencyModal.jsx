import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAddDependency, useRemoveDependency } from '../../hooks/useTasks';
import { Lock, Trash2 } from 'lucide-react';

export const AddDependencyModal = ({ isOpen, onClose, projectId, task, allTasks }) => {
  const [prereqId, setPrereqId] = useState('');
  const [error, setError] = useState(null);

  const addDependency = useAddDependency(projectId);
  const removeDependency = useRemoveDependency(projectId);

  if (!task) return null;

  const currentPrereqIds = (task.dependencies || []).map((d) => d.id);
  const eligibleTasks = allTasks.filter(
    (t) => t.id !== task.id && !currentPrereqIds.includes(t.id)
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!prereqId) return;
    setError(null);

    try {
      await addDependency.mutateAsync({
        taskId: task.id,
        prerequisite_task_id: prereqId,
      });
      setPrereqId('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (prerequisiteTaskId) => {
    setError(null);
    try {
      await removeDependency.mutateAsync({
        taskId: task.id,
        prerequisiteTaskId,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Kelola Dependensi: ${task.title}`}>
      <div className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <h4 className="text-xs font-bold text-stone-800 mb-2.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-orange-500" />
            Prasyarat yang Harus Selesai Sebelum Tugas Ini:
          </h4>

          {task.dependencies && task.dependencies.length > 0 ? (
            <div className="space-y-2">
              {task.dependencies.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#ECE0D0] text-xs font-medium"
                >
                  <div>
                    <span className="font-bold text-stone-900">{dep.title}</span>
                    <span
                      className={`ml-2 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        dep.status === 'Done'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemove(dep.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus dependensi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#ECE0D0]">
              Belum ada tugas prasyarat. Tugas ini dapat langsung dikerjakan dan diselesaikan.
            </p>
          )}
        </div>

        {/* Add new prerequisite form */}
        <form onSubmit={handleAdd} className="pt-4 border-t border-[#F2E5D5] space-y-3">
          <label className="block text-xs font-bold text-stone-700">
            Tambah Tugas Prasyarat Baru:
          </label>

          {eligibleTasks.length > 0 ? (
            <div className="flex gap-2">
              <select
                value={prereqId}
                onChange={(e) => setPrereqId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-xs focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer font-medium"
              >
                <option value="">Pilih Tugas Prasyarat...</option>
                {eligibleTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white text-stone-900">
                    {t.title} ({t.status})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!prereqId || addDependency.isPending}
                className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
              >
                {addDependency.isPending ? 'Menautkan...' : 'Tautkan'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-stone-400">
              Tidak ada tugas lain yang tersedia untuk dijadikan prasyarat.
            </p>
          )}
        </form>

        <div className="flex justify-end pt-2 border-t border-[#F2E5D5]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-2xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
