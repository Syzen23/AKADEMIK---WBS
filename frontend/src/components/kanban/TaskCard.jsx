import React, { useState, useRef } from 'react';
import { PriorityBadge } from '../ui/Badge';
import {
  Calendar,
  AlertTriangle,
  Lock,
  MoreVertical,
  Trash2,
  GripVertical,
  CheckCircle2,
  UserPlus,
  Users,
  Clock,
  Pencil,
} from 'lucide-react';

export const TaskCard = ({
  task,
  onUpdateStatus,
  onOpenWorkLog,
  onOpenAddDependency,
  onDeleteTask,
  onUpdateDueDate,
  onClaimTask,
  onEditTask,
  isLeader,
  currentUserId,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isDraggingRef = useRef(false);

  // Helper date key
  const toDateKey = (dateInput) => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = toDateKey(new Date());
  const taskDueDateKey = toDateKey(task.due_date);

  // Contributors & Assignment info (Max 4 people)
  const contributors = task.contributors || [];
  const hasContributors = contributors.length > 0;
  const amIContributor = Boolean(
    currentUserId &&
      (task.assigned_to === currentUserId ||
        contributors.some((c) => c.user_id === currentUserId || c.id === currentUserId))
  );

  // Determine deadline badge styling and text
  const getDueBadgeInfo = () => {
    if (!task.due_date) {
      return {
        label: '+ Tenggat',
        style:
          'bg-stone-50 hover:bg-orange-50 border-stone-200 hover:border-orange-300 text-stone-400 hover:text-orange-600 border-dashed',
        isOverdue: false,
      };
    }

    const formattedDate = new Date(task.due_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

    if (task.status === 'Done') {
      return {
        label: formattedDate,
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        isOverdue: false,
      };
    }

    if (taskDueDateKey === todayKey) {
      return {
        label: 'Hari Ini',
        style: 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold animate-pulse',
        isOverdue: false,
      };
    }

    const d1 = new Date(todayKey);
    const d2 = new Date(taskDueDateKey);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      return {
        label: 'Besok',
        style: 'bg-orange-50 text-orange-700 border-orange-200 font-bold',
        isOverdue: false,
      };
    }
    if (diff < 0) {
      return {
        label: `Lewat ${Math.abs(diff)}h (${formattedDate})`,
        style: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        isOverdue: true,
      };
    }
    return {
      label: `${formattedDate} (${diff}h)`,
      style: 'bg-[#FAF5EE] text-stone-700 border-[#E8DACB] font-semibold',
      isOverdue: false,
    };
  };

  const dueBadge = getDueBadgeInfo();

  const handleSelectQuickDate = async (offsetDays) => {
    setShowDatePicker(false);
    if (!onUpdateDueDate) return;

    if (offsetDays === null) {
      await onUpdateDueDate(task.id, null);
      return;
    }

    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    await onUpdateDueDate(task.id, `${y}-${m}-${day}`);
  };

  // Check if task has unfinished dependencies
  const unfinishedDeps = (task.dependencies || []).filter((d) => d.status !== 'Done');
  const isLocked = unfinishedDeps.length > 0 && task.status !== 'Done';
  const isAssignedToMe = task.assigned_to === currentUserId || amIContributor;
  const canUpdateStatus = isLeader || isAssignedToMe || !task.assigned_to;

  const handleStatusChange = async (newStatus) => {
    setStatusError(null);
    try {
      await onUpdateStatus(task.id, newStatus);
    } catch (err) {
      setStatusError(err.message);
      setTimeout(() => setStatusError(null), 6000);
    }
  };

  const handleDragStart = (e) => {
    if (!canUpdateStatus) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleCardClick = (e) => {
    if (isDraggingRef.current) return;
    // Don't trigger if clicked on an action button, menu, input, or interactive element
    if (e.target.closest('button, select, input, a, [data-prevent-card-click="true"]')) {
      return;
    }
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const statusOptions = ['To Do', 'In Progress', 'Blocked', 'Done'];

  return (
    <div
      onClick={handleCardClick}
      draggable={canUpdateStatus}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title="Klik kartu untuk membuka detail & instruksi tugas"
      className={`group relative bg-white hover:bg-[#FFFCF9] border rounded-3xl p-4.5 shadow-xs transition-all duration-200 select-none cursor-pointer ${
        isDragging
          ? 'opacity-40 scale-95 border-dashed border-orange-400 shadow-none'
          : 'border-[#EFE5D9] hover:border-orange-300 hover:shadow-md hover:shadow-orange-950/5 hover:-translate-y-0.5'
      } ${canUpdateStatus ? 'active:cursor-grabbing' : ''}`}
    >
      {/* Top row: Priority & Badges & Options */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {canUpdateStatus && (
            <GripVertical className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-400 transition-colors shrink-0" />
          )}
          <PriorityBadge priority={task.priority} />
          {task.stage_name && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-stone-600 font-medium border border-[#EFE4D6] truncate max-w-[120px]">
              {task.stage_name}
            </span>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#EFE5D9] rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowMenu(false)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  if (onEditTask) onEditTask(task);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:text-orange-600 hover:bg-orange-50/60 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-orange-500" />
                <span>{isLeader ? 'Edit Detail & Konteks Tugas' : 'Lihat Detail & Konteks'}</span>
              </button>

              {isLeader && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenAddDependency(task);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:text-orange-600 hover:bg-orange-50/60 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Atur Dependensi Prasyarat
                </button>
              )}

              {canUpdateStatus && (
                <div className="border-t border-[#F5ECE1] my-1 pt-1 px-3.5 py-1">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                    Pindah Status:
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {statusOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={task.status === st}
                        onClick={() => {
                          setShowMenu(false);
                          handleStatusChange(st);
                        }}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg text-left truncate transition-colors cursor-pointer ${
                          task.status === st
                            ? 'bg-orange-100 text-orange-700 font-bold'
                            : 'hover:bg-stone-100 text-stone-600'
                        }`}
                      >
                        {st === 'In Progress' ? 'Progress' : st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLeader && (
                <div className="border-t border-[#F5ECE1] mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteTask(task.id);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Tugas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h4 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors leading-snug mb-1">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Dependency Warning / Lock Box - Clickable directly to manage! */}
      {isLocked && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (isLeader && onOpenAddDependency) {
              onOpenAddDependency(task);
            }
          }}
          className={`mb-3 p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs transition-all ${
            isLeader ? 'hover:bg-amber-100/80 hover:border-amber-300 cursor-pointer' : ''
          }`}
          title={isLeader ? 'Klik untuk mengelola dependensi prasyarat' : undefined}
        >
          <div className="flex items-center justify-between gap-1.5 font-bold text-[11px] text-amber-800 mb-1">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Terkunci oleh {unfinishedDeps.length} prasyarat:</span>
            </div>
            {isLeader && (
              <span className="text-[10px] text-amber-700 underline font-medium">Kelola</span>
            )}
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800/90">
            {unfinishedDeps.map((dep) => (
              <li key={dep.id} className="truncate">
                {dep.title} ({dep.status})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error alert if blocked move to Done */}
      {statusError && (
        <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-1.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="leading-tight font-medium">{statusError}</span>
        </div>
      )}

      {/* Footer Info: Assignee/Contributors & Work Log Chip */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F5ECE1] text-xs text-stone-500">
        {/* Pelaksana / Contributors (Maksimal 4 Orang) */}
        <div className="flex items-center gap-1.5 min-w-0">
          {hasContributors ? (
            contributors.length === 1 ? (
              <div
                className="flex items-center gap-1.5"
                title={`Pelaksana: ${contributors[0].name}`}
              >
                <img
                  src={
                    contributors[0].avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${contributors[0].name}`
                  }
                  alt={contributors[0].name}
                  className="w-6 h-6 rounded-full ring-1.5 ring-orange-200 bg-orange-50 shrink-0 object-cover"
                />
                <span className="text-[11px] text-stone-700 font-bold truncate max-w-[95px]">
                  {contributors[0].name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                title={`Pelaksana (${contributors.length}/4 orang):\n${contributors
                  .map((c) => `• ${c.name}`)
                  .join('\n')}`}
              >
                <div className="flex -space-x-2 overflow-hidden py-0.5">
                  {contributors.slice(0, 4).map((c) => (
                    <img
                      key={c.id}
                      src={
                        c.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`
                      }
                      alt={c.name}
                      title={c.name}
                      className="inline-block w-6 h-6 rounded-full ring-2 ring-white bg-orange-50 shrink-0 object-cover shadow-2xs"
                    />
                  ))}
                </div>
                <span className="text-[10px] text-stone-500 font-extrabold bg-[#FAF5EE] px-1.5 py-0.5 rounded-md border border-[#EFE4D6]">
                  {contributors.length}/4
                </span>
              </div>
            )
          ) : task.assigned_to_name ? (
            <div className="flex items-center gap-1.5" title={`Ditugaskan ke: ${task.assigned_to_name}`}>
              <img
                src={
                  task.assigned_to_avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigned_to_name}`
                }
                alt={task.assigned_to_name}
                className="w-6 h-6 rounded-full ring-1.5 ring-orange-200 bg-orange-50 shrink-0 object-cover"
              />
              <span className="text-[11px] text-stone-700 font-semibold truncate max-w-[95px]">
                {task.assigned_to_name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClaimTask) onClaimTask(task.id);
              }}
              title="Klik untuk mengambil/mengerjakan tugas ini"
              className="group/claim flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-orange-600 bg-[#FAF7F2] hover:bg-orange-50 px-2 py-0.5 rounded-xl border border-dashed border-[#DFCDBB] hover:border-orange-300 transition-all cursor-pointer"
            >
              <UserPlus className="w-3 h-3 text-stone-400 group-hover/claim:text-orange-500" />
              <span>+ Ambil Tugas</span>
            </button>
          )}
        </div>

        {/* Target Deadline Hari Interactive Chip */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDatePicker(!showDatePicker);
            }}
            title={task.due_date ? `Tenggat: ${taskDueDateKey}` : 'Klik untuk atur tenggat hari'}
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${dueBadge.style}`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{dueBadge.label}</span>
          </button>

          {/* Quick Deadline Popover */}
          {showDatePicker && (
            <div
              className="absolute right-0 bottom-full mb-1.5 w-52 bg-white border border-[#EFE5D9] rounded-2xl shadow-xl p-3 z-30 animate-in fade-in duration-100"
              onClick={(e) => e.stopPropagation()}
              onMouseLeave={() => setShowDatePicker(false)}
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 px-0.5">
                <span>Target Tenggat Hari:</span>
                {task.due_date && (
                  <button
                    type="button"
                    onClick={() => handleSelectQuickDate(null)}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer lowercase"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Quick day presets */}
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectQuickDate(0)}
                  className="py-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickDate(1)}
                  className="py-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Besok
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickDate(3)}
                  className="py-1 px-2 rounded-lg bg-[#FAF7F2] hover:bg-orange-500 hover:text-white text-stone-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  +3 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickDate(7)}
                  className="py-1 px-2 rounded-lg bg-[#FAF7F2] hover:bg-orange-500 hover:text-white text-stone-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  +1 Minggu
                </button>
              </div>

              {/* Custom Date Input */}
              <div className="pt-2 border-t border-[#F5ECE1]">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Pilih Kalender:
                </label>
                <input
                  type="date"
                  value={taskDueDateKey || ''}
                  onChange={(e) => {
                    setShowDatePicker(false);
                    if (onUpdateDueDate) {
                      onUpdateDueDate(task.id, e.target.value || null);
                    }
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5D7C7] text-stone-800 font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

