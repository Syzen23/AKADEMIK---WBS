import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useJoinProject } from '../../hooks/useProjects';

export const JoinProjectModal = ({ isOpen, onClose }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState(null);

  const joinProject = useJoinProject();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await joinProject.mutateAsync(inviteCode.trim().toUpperCase());
      setInviteCode('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gabung ke Ruang Proyek">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Kode Undangan (Invite Code)
          </label>
          <input
            type="text"
            required
            maxLength={16}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Contoh: AKAD2026"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm font-mono tracking-wider focus:border-orange-500 focus:bg-white focus:outline-none transition-all uppercase placeholder:text-stone-400"
          />
          <p className="text-[11px] text-stone-500 mt-1.5 font-medium">
            Dapatkan kode unik dari ketua kelompok (Project Leader) Anda.
          </p>
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
            disabled={joinProject.isPending}
            className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {joinProject.isPending ? 'Memproses...' : 'Gabung Sekarang'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
