import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTaskWorkLogs, useAddWorkLog, useDeleteWorkLog } from '../../hooks/useWorkLogs';
import { Clock, Plus, Trash2 } from 'lucide-react';

export const WorkLogModal = ({ isOpen, onClose, projectId, task }) => {
  const [hoursSpent, setHoursSpent] = useState('2.0');
  const [activityNotes, setActivityNotes] = useState('');
  const [error, setError] = useState(null);

  const taskId = task?.id;
  const { data: logs = [], isLoading } = useTaskWorkLogs(projectId, taskId);
  const addWorkLog = useAddWorkLog(projectId, taskId);
  const deleteWorkLog = useDeleteWorkLog(projectId, taskId);

  if (!task) return null;

  const totalLoggedOnTask = logs.reduce((acc, l) => acc + parseFloat(l.hours_spent || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await addWorkLog.mutateAsync({
        hours_spent: parseFloat(hoursSpent),
        activity_notes: activityNotes.trim() || null,
      });
      setActivityNotes('');
      setHoursSpent('2.0');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Catat Log Jam Kerja: ${task.title}`}>
      <div className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Task Hours Summary */}
        <div className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#ECE0D0] text-xs">
          <div>
            <span className="text-stone-500 font-medium">Estimasi Tugas: </span>
            <span className="font-bold text-stone-900">{task.estimated_hours} Jam</span>
          </div>
          <div>
            <span className="text-stone-500 font-medium">Total Jam Tercatat: </span>
            <span className="font-extrabold text-orange-600">{totalLoggedOnTask} Jam</span>
          </div>
        </div>

        {/* Add log form */}
        <form onSubmit={handleSubmit} className="space-y-3 p-4.5 bg-[#FAF7F2] rounded-2xl border border-[#ECE0D0]">
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-orange-500" />
            Tambah Entri Jam Kerja Baru
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Jam Kerja (Hours) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5D7C7] text-stone-900 text-xs focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Catatan Aktivitas / Kontribusi
              </label>
              <input
                type="text"
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder="Contoh: Menyelesaikan query database dan testing API..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5D7C7] text-stone-900 text-xs focus:border-orange-500 focus:outline-none transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={addWorkLog.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              {addWorkLog.isPending ? 'Menyimpan...' : 'Simpan Log'}
            </button>
          </div>
        </form>

        {/* Previous work logs list */}
        <div>
          <h4 className="text-xs font-bold text-stone-800 mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            Riwayat Log Jam Kerja:
          </h4>

          {isLoading ? (
            <div className="text-xs text-stone-400 text-center py-4">Memuat log...</div>
          ) : logs.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#ECE0D0] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        log.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_name}`
                      }
                      alt={log.user_name}
                      className="w-7 h-7 rounded-full ring-1 ring-orange-200 bg-orange-50"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{log.user_name}</span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {new Date(log.logged_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {log.activity_notes && (
                        <p className="text-[11px] text-stone-500 mt-0.5">{log.activity_notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                      {log.hours_spent}h
                    </span>
                    <button
                      onClick={() => deleteWorkLog.mutate(log.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Hapus log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic p-4 text-center bg-[#FAF7F2] rounded-2xl border border-[#ECE0D0]">
              Belum ada jam kerja yang dicatat pada tugas ini.
            </p>
          )}
        </div>

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
