import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useCreateProject } from '../../hooks/useProjects';

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState(null);

  const createProject = useCreateProject();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await createProject.mutateAsync({
        title,
        course_name: courseName,
        description,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      setTitle('');
      setCourseName('');
      setDescription('');
      setDeadline('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Ruang Proyek Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Judul Proyek / Tugas Akhir *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Sistem Informasi Manajemen Capstone WBS"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Mata Kuliah *
          </label>
          <input
            type="text"
            required
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Contoh: Rekayasa Perangkat Lunak Terapan"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Deskripsi Proyek
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan gambaran umum tujuan dan ruang lingkup tugas..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Tenggat Waktu Akhir (Deadline)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
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
            disabled={createProject.isPending}
            className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {createProject.isPending ? 'Menyimpan...' : 'Buat Proyek'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
