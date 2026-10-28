import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAddAsset } from '../../hooks/useAssets';

export const AssetModal = ({ isOpen, onClose, projectId }) => {
  const [title, setTitle] = useState('');
  const [assetType, setAssetType] = useState('github');
  const [assetUrl, setAssetUrl] = useState('');
  const [error, setError] = useState(null);

  const addAsset = useAddAsset(projectId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await addAsset.mutateAsync({
        title,
        asset_type: assetType,
        asset_url: assetUrl.trim(),
      });
      setTitle('');
      setAssetUrl('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tautkan Dokumen / Aset Proyek">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Judul Tautan Aset *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Repositori Frontend & Backend GitHub"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Kategori Aset *
          </label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all cursor-pointer font-medium"
          >
            <option value="github">GitHub Repository</option>
            <option value="figma">Figma UI/UX Mockup</option>
            <option value="docs">Google Docs / SRS Document</option>
            <option value="gdrive">Google Drive Folder</option>
            <option value="other">Tautan Eksternal Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            URL Tautan Valid *
          </label>
          <input
            type="url"
            required
            value={assetUrl}
            onChange={(e) => setAssetUrl(e.target.value)}
            placeholder="https://github.com/... atau https://figma.com/..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-all font-mono placeholder:text-stone-400"
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
            disabled={addAsset.isPending}
            className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {addAsset.isPending ? 'Menautkan...' : 'Simpan Tautan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
