import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useCreateStage } from '../../hooks/useStages';

export const CreateStageModal = ({ isOpen, onClose, projectId, currentStagesCount }) => {
  const [name, setName] = useState('');
  const [stageOrder, setStageOrder] = useState(currentStagesCount + 1);
  const [error, setError] = useState(null);

  const createStage = useCreateStage(projectId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await createStage.mutateAsync({
        name,
        stage_order: parseInt(stageOrder, 10) || currentStagesCount + 1,
      });
      setName('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Tahapan WBS Baru">
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
            placeholder="Contoh: 5. Pengujian & Evaluasi Akhir"
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
            disabled={createStage.isPending}
            className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {createStage.isPending ? 'Menyimpan...' : 'Simpan Tahap'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
