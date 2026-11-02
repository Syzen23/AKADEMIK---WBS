import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import {
  useMemos,
  useCreateMemo,
  useUpdateMemo,
  useDeleteMemo,
} from '../../hooks/useMemos';
import { ConvertMemoModal } from './ConvertMemoModal';
import { useToast } from '../../context/ToastContext';
import {
  StickyNote,
  Send,
  Plus,
  Rocket,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  FolderKanban,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const QuickMemoModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { data: memos = [], isLoading } = useMemos();
  const createMemo = useCreateMemo();
  const updateMemo = useUpdateMemo();
  const deleteMemo = useDeleteMemo();

  // Form states
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'unconverted' | 'converted'

  // Convert modal state
  const [convertTargetMemo, setConvertTargetMemo] = useState(null);

  // Reset form
  const handleResetForm = () => {
    setEditingMemoId(null);
    setTitle('');
    setContent('');
  };

  // Populate form for editing
  const handleStartEdit = (memo) => {
    setEditingMemoId(memo.id);
    setTitle(memo.title || '');
    setContent(memo.content || '');
  };

  // Submit create / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Judul catatan wajib diisi.');
      return;
    }
    if (!content.trim()) {
      toast.error('Isi catatan wajib diisi.');
      return;
    }

    try {
      if (editingMemoId) {
        await updateMemo.mutateAsync({
          memoId: editingMemoId,
          payload: { title: title.trim(), content: content.trim() },
        });
        toast.success('Catatan berhasil diperbarui.');
      } else {
        await createMemo.mutateAsync({
          title: title.trim(),
          content: content.trim(),
        });
        toast.success('Catatan cepat berhasil disimpan!');
      }
      handleResetForm();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan catatan.');
    }
  };

  // Delete memo
  const handleDelete = async (memo) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus catatan "${memo.title}"?`
      )
    ) {
      return;
    }
    try {
      await deleteMemo.mutateAsync(memo.id);
      if (editingMemoId === memo.id) handleResetForm();
      toast.success('Catatan berhasil dihapus.');
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus catatan.');
    }
  };

  // Filter memos
  const filteredMemos = useMemo(() => {
    return memos.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === 'unconverted') return !m.is_converted;
      if (filterStatus === 'converted') return m.is_converted;
      return true;
    });
  }, [memos, searchQuery, filterStatus]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Catatan Cepat & Memo Mahasiswa"
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          {/* Top Informative Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border border-amber-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                <StickyNote className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 leading-tight">
                  Papan Memo Bebas Hambatan (0-Latency)
                </h4>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-tight">
                  Catat materi seminar, arahan dosen, atau ide tugas secara instan. Kapan saja bisa dikonversi menjadi tugas proyek WBS.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-800 bg-white/80 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{memos.length} Catatan Tersimpan</span>
            </div>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (5 Cols): Fast Input Form */}
            <div className="lg:col-span-5 bg-stone-50/70 border border-stone-200 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  {editingMemoId ? (
                    <>
                      <Pencil className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edit Catatan</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-orange-600" />
                      <span>Tulis Catatan Baru</span>
                    </>
                  )}
                </span>
                {editingMemoId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-[10px] font-bold text-stone-500 hover:text-stone-800 underline cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Input 1: Judul */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Judul Catatan / Topik <strong className="text-rose-500">*</strong>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="cth: Materi Seminar Cloud & WBS Capstone"
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-stone-400"
                    autoFocus
                  />
                </div>

                {/* Input 2: Isi Textarea */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Isi Catatan / Poin Penting <strong className="text-rose-500">*</strong>
                  </label>
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis poin-poin materi dosen, ringkasan seminar, todo sementara, atau konsep tugas akhir Anda..."
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-stone-400 leading-relaxed resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={createMemo.isPending || updateMemo.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {editingMemoId
                        ? updateMemo.isPending
                          ? 'Menyimpan...'
                          : 'Perbarui Catatan'
                        : createMemo.isPending
                        ? 'Menyimpan...'
                        : 'Simpan Catatan'}
                    </span>
                  </button>

                  {editingMemoId && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column (7 Cols): Saved Memo Cards */}
            <div className="lg:col-span-7 space-y-3">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari catatan tersimpan..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-stone-400"
                  />
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200/70 text-[11px] shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterStatus === 'all'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Semua ({memos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('unconverted')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterStatus === 'unconverted'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Belum Jadi Tugas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('converted')}
                    className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterStatus === 'converted'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Sudah Jadi Tugas
                  </button>
                </div>
              </div>

              {/* Cards List container with scroll */}
              <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-stone-400">
                    Memuat daftar catatan...
                  </div>
                ) : filteredMemos.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
                    <StickyNote className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-600">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Tidak ada catatan yang cocok dengan filter'
                        : 'Belum ada catatan tersimpan'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1 max-w-sm mx-auto">
                      Tulis materi seminar atau ide kuliah pertama Anda pada formulir di sebelah kiri untuk menyimpannya secara instan.
                    </p>
                  </div>
                ) : (
                  filteredMemos.map((memo) => (
                    <div
                      key={memo.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        memo.is_converted
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1">
                            {memo.title}
                          </h4>
                          <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(memo.created_at)}
                          </span>
                        </div>

                        {/* Top action icons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(memo)}
                            title="Edit Catatan"
                            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(memo)}
                            title="Hapus Catatan"
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <p className="text-[11px] text-stone-600 whitespace-pre-wrap leading-relaxed line-clamp-4 bg-stone-50/60 p-2.5 rounded-xl border border-stone-100 mb-2.5 font-normal">
                        {memo.content}
                      </p>

                      {/* Card Footer: Conversion Status & Convert Button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-stone-100">
                        {memo.is_converted ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              Tugas: {memo.linked_project_title || 'Proyek'} (
                              {memo.linked_task_status || 'Aktif'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Catatan Belum Dikonversi
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setConvertTargetMemo(memo)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                            memo.is_converted
                              ? 'text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-300'
                              : 'text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20 hover:scale-[1.02]'
                          }`}
                        >
                          <Rocket className="w-3 h-3 shrink-0" />
                          <span>{memo.is_converted ? 'Tautkan Lagi' : 'Jadikan Tugas Proyek'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Convert Memo to Project Task Modal */}
      {convertTargetMemo && (
        <ConvertMemoModal
          isOpen={!!convertTargetMemo}
          onClose={() => setConvertTargetMemo(null)}
          memo={convertTargetMemo}
          onSuccess={() => {
            setConvertTargetMemo(null);
          }}
        />
      )}
    </>
  );
};
