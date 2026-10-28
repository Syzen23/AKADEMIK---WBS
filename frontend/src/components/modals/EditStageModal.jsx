import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useUpdateStage } from '../../hooks/useStages';
import { useToast } from '../../context/ToastContext';
import { Layers } from 'lucide-react';

export const EditStageModal = ({ isOpen, onClose, projectId, stage }) => {
  const [name, setName] = useState('');
  const [stageOrder, setStageOrder] = useState(1);
  const [error, setError] = useState(null);

  const toast = useToast();
  const updateStage = useUpdateStage(projectId);

  useEffect(() => {
    if (stage) {
      setName(stage.name || '');
      setStageOrder(stage.stage_order || 1);
      setError(null);
    }
  }, [stage, isOpen]);

  if (!stage) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama tahap tidak boleh kosong.');
      return;
    }

    try {
      await updateStage.mutateAsync({
        stageId: stage.id,
        data: {
          name: name.trim(),
          stage_order: parseInt(stageOrder, 10) || 1,
        },
      });
      toast.success(`Tahap "${name}" berhasil diperbarui!`);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal memperbarui tahap WBS.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Tahapan WBS">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Nama Tahap (Phase Name) *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: 1. Analisis Kebutuhan & SRS"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Urutan Tahap (Stage Order)
          </label>
          <input
            type="number"
            min="1"
            value={stageOrder}
            onChange={(e) => setStageOrder(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F0E5D7]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={updateStage.isPending}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs hover:shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {updateStage.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
