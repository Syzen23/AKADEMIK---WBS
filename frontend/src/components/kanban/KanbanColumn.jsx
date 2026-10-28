import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus, Check, X, Sparkles } from 'lucide-react';

export const KanbanColumn = ({
  status,
  title,
  tasks,
  onUpdateStatus,
  onOpenWorkLog,
  onOpenAddDependency,
  onDeleteTask,
  onOpenCreateTask,
  onQuickCreateTask,
  onQuickLogHours,
  onClaimTask,
  onUpdateDueDate,
  onEditTask,
  hasStages = true,
  isLeader,
  currentUserId,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columnStyles = {
    'To Do': {
      indicator: 'bg-stone-400',
      badge: 'bg-white text-stone-700 border-stone-200',
    },
    'In Progress': {
      indicator: 'bg-orange-500 shadow-xs shadow-orange-500/40',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    Blocked: {
      indicator: 'bg-amber-500 shadow-xs shadow-amber-500/40',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    Done: {
      indicator: 'bg-emerald-500 shadow-xs shadow-emerald-500/40',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  const style = columnStyles[status] || columnStyles['To Do'];

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only set false if leaving column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Check if task is already in this column
    const existing = tasks.find((t) => t.id === taskId);
    if (existing && existing.status === status) return;

    try {
      await onUpdateStatus(taskId, status);
    } catch {
      // Error handled inside onUpdateStatus
    }
  };

  const handleInlineSubmit = async (e) => {
    e?.preventDefault();
    if (!inlineTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onQuickCreateTask) {
        await onQuickCreateTask({ title: inlineTitle.trim(), status });
        setInlineTitle('');
        setIsAddingInline(false);
      }
    } catch {
      // Handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInlineSubmit();
    } else if (e.key === 'Escape') {
      setIsAddingInline(false);
      setInlineTitle('');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-3xl p-3.5 sm:p-4 w-full min-w-0 sm:min-w-[270px] flex-1 transition-all duration-200 border ${
        isDragOver
          ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-400/40 scale-[1.01]'
          : 'bg-[#F6F1E8]/70 border-[#ECE0D0]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E8DACB]">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${style.indicator}`} />
          <h3 className="font-bold text-sm text-stone-800">{title}</h3>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${style.badge}`}>
            {tasks.length}
          </span>
        </div>

        {isLeader && onOpenCreateTask && (
          <button
            onClick={() => onOpenCreateTask(status)}
            className="p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-100/60 rounded-xl transition-colors cursor-pointer"
            title="Buka dialog formulir tugas lengkap"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Inline Task Creator (Step 3) */}
      {isLeader && hasStages && (
        <div className="mb-3">
          {isAddingInline ? (
            <div className="p-3 bg-white border border-orange-300 rounded-2xl shadow-sm space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <input
                type="text"
                autoFocus
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis nama tugas... (Tekan Enter)"
                className="w-full text-xs text-stone-900 placeholder:text-stone-400 outline-none font-medium bg-transparent"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between pt-1 border-t border-[#F5ECE1]">
                <span className="text-[10px] text-stone-400">Tekan Enter ↵ untuk simpan</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingInline(false);
                      setInlineTitle('');
                    }}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Batal (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!inlineTitle.trim() || isSubmitting}
                    onClick={handleInlineSubmit}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <Check className="w-3 h-3" />
                    <span>{isSubmitting ? '...' : 'Tambah'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingInline(true)}
              className="w-full py-2 px-3 rounded-2xl border border-dashed border-[#DFCDBB] hover:border-orange-400 bg-white/50 hover:bg-white text-stone-500 hover:text-orange-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-500 transition-colors" />
              <span>+ Tambah Tugas Cepat</span>
            </button>
          )}
        </div>
      )}

      {/* Cards container */}
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[350px] pr-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdateStatus={onUpdateStatus}
            onOpenWorkLog={onOpenWorkLog}
            onOpenAddDependency={onOpenAddDependency}
            onDeleteTask={onDeleteTask}
            onQuickLogHours={onQuickLogHours}
            onClaimTask={onClaimTask}
            onUpdateDueDate={onUpdateDueDate}
            onEditTask={onEditTask}
            isLeader={isLeader}
            currentUserId={currentUserId}
          />
        ))}

        {tasks.length === 0 && !isAddingInline && (
          <div
            className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              isDragOver
                ? 'border-orange-400 bg-orange-100/50 text-orange-700'
                : 'border-[#E3D3C2] bg-white/40 text-stone-400'
            }`}
          >
            <span>{isDragOver ? 'Lepas kartu di sini' : 'Belum ada tugas di kolom ini'}</span>
            <span className="text-[10px] text-stone-400 mt-1">Tarik kartu tugas ke sini</span>
          </div>
        )}
      </div>
    </div>
  );
};

