import React, { useState } from 'react';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { Layers, ChevronDown, ChevronRight, Plus, Trash2, Calendar, Lock, Sparkles, Pencil } from 'lucide-react';

export const WbsStageList = ({
  stages,
  tasks,
  isLeader,
  onOpenCreateStage,
  onOpenCreateTaskWithStage,
  onEditStage,
  onEditTask,
  onDeleteStage,
  onDeleteTask,
  onApplyTemplate,
  isApplyingTemplate = false,
}) => {
  const [collapsedStages, setCollapsedStages] = useState({});

  const isStageExpanded = (stageId) => !collapsedStages[stageId];

  const toggleExpand = (stageId) => {
    setCollapsedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#ECE0D0] shadow-xs">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500 shrink-0" />
            <span>Hierarki Work Breakdown Structure (WBS)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Dekomposisi tahapan proyek ke dalam paket kerja dan target tenggat hari terukur.
          </p>
        </div>

        {isLeader && (
          <button
            onClick={onOpenCreateStage}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tahap WBS</span>
          </button>
        )}
      </div>

      {/* Stage Items */}
      <div className="space-y-3.5">
        {stages.map((stage) => {
          const stageTasks = tasks.filter((t) => t.stage_id === stage.id);
          const totalHours = stageTasks.reduce(
            (acc, t) => acc + parseFloat(t.estimated_hours || 0),
            0
          );
          const doneCount = stageTasks.filter((t) => t.status === 'Done').length;
          const progressPercent =
            stageTasks.length > 0 ? Math.round((doneCount / stageTasks.length) * 100) : 0;
          const isExpanded = isStageExpanded(stage.id);

          return (
            <div
              key={stage.id}
              className="bg-white border border-[#ECE0D0] rounded-3xl overflow-hidden transition-all shadow-xs"
            >
              {/* Stage Header */}
              <div className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2]/80 hover:bg-[#FAF7F2] transition-colors border-b border-[#F0E5D7]">
                <div
                  className="flex items-center gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => toggleExpand(stage.id)}
                >
                  <button className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-orange-100/80 border border-orange-200/90 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {stage.stage_order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-stone-900 truncate">{stage.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-0.5">
                      <span>{stageTasks.length} Tugas</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-orange-700 font-semibold">
                        <Calendar className="w-3 h-3 text-orange-500" />
                        {stageTasks.filter((t) => t.due_date).length} Berjadwal
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">
                        {doneCount}/{stageTasks.length} Selesai ({progressPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-9 sm:pl-0">
                  {isLeader && (
                    <>
                      <button
                        onClick={() => onOpenCreateTaskWithStage(stage.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100/80 border border-orange-200/90 rounded-2xl transition-all cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-orange-600" />
                        <span>Tambah Tugas</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditStage && onEditStage(stage)}
                          className="p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Edit nama atau urutan tahap WBS"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteStage(stage.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Hapus tahap WBS"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-[#F2E8DC] h-1.5">
                <div
                  className="bg-orange-500 h-1.5 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Task list inside Stage */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  {stageTasks.length > 0 ? (
                    <div className="space-y-2">
                      {stageTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF9F3] border border-[#ECE0D0] text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            <StatusBadge status={task.status} />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-stone-900 truncate block">
                                {task.title}
                              </span>
                              {task.dependencies && task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium mt-0.5 truncate">
                                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="truncate">
                                    Prasyarat:{' '}
                                    {task.dependencies.map((d) => d.title).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-4 pl-8 sm:pl-0">
                            <PriorityBadge priority={task.priority} />

                            {task.due_date ? (
                              <span className="text-stone-600 bg-white border border-[#E8DACB] px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-semibold shrink-0">
                                <Calendar className="w-3 h-3 text-orange-500" />
                                {new Date(task.due_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[11px] font-medium shrink-0">
                                Belum ada tenggat
                              </span>
                            )}

                            {task.assigned_to_name ? (
                              <div className="flex items-center gap-1.5 text-stone-700 font-semibold shrink-0">
                                <img
                                  src={
                                    task.assigned_to_avatar ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigned_to_name}`
                                  }
                                  alt={task.assigned_to_name}
                                  className="w-5 h-5 rounded-full ring-1 ring-orange-200"
                                />
                                <span className="truncate max-w-[100px]">
                                  {task.assigned_to_name.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic text-[11px] shrink-0">
                                Belum ditugaskan
                              </span>
                            )}

                            {isLeader && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onEditTask && onEditTask(task)}
                                  className="p-1 text-stone-400 hover:text-orange-600 rounded-lg transition-colors cursor-pointer"
                                  title="Edit detail tugas"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteTask(task.id)}
                                  className="p-1 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus tugas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-stone-400 font-medium">
                      Belum ada tugas pada tahap ini.{' '}
                      {isLeader && 'Klik "Tambah Tugas" untuk mengisi paket kerja.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {stages.length === 0 && (
          <div className="p-10 text-center bg-white border border-[#ECE0D0] rounded-3xl shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Belum Ada Tahap WBS yang Dibuat</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
              Dekomposisi tahapan proyek akhir Anda misal: <br /> <em>1. Analisis Kebutuhan</em>, <em>2. Desain Arsitektur</em>, <em>3. Implementasi</em>.
            </p>
            {isLeader && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
                {onApplyTemplate && (
                  <button
                    onClick={onApplyTemplate}
                    disabled={isApplyingTemplate}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isApplyingTemplate ? 'Menerapkan Template...' : 'Gunakan Template Standar Capstone (4 Tahap)'}</span>
                  </button>
                )}
                {onOpenCreateStage && (
                  <button
                    onClick={onOpenCreateStage}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-orange-600 bg-[#FAF7F2] hover:bg-[#FFF4ED] border border-[#E8DACB] rounded-2xl transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-orange-500" />
                    <span>Buat Tahap Manual</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
