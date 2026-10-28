import React, { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { Filter, Users, Layers, Search, Plus, Sparkles, X } from 'lucide-react';

export const KanbanBoard = ({
  tasks,
  stages = [],
  members = [],
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
  onOpenCreateStage,
  isLeader,
  currentUserId,
}) => {
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on stage, member, and search query
  const filteredTasks = tasks.filter((task) => {
    if (selectedStage && task.stage_id !== selectedStage) return false;
    if (selectedMember && task.assigned_to !== selectedMember) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (task.title || '').toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      const matchAssignee = (task.assigned_to_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  const columns = [
    { status: 'To Do', title: 'Belum Dimulai' },
    { status: 'In Progress', title: 'Sedang Dikerjakan' },
    { status: 'Blocked', title: 'Terkendala / Terkunci' },
    { status: 'Done', title: 'Selesai' },
  ];

  return (
    <div className="space-y-4">
      {/* If no stages exist, guide user to create first stage */}
      {stages.length === 0 && (
        <div className="p-5 rounded-3xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Belum Ada Tahap WBS di Proyek Ini</h4>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Tugas WBS memerlukan tahap kerja (misal: <em>1. Analisis</em>, <em>2. Desain</em>, <em>3. Implementasi</em>).
              </p>
            </div>
          </div>

          {isLeader && onOpenCreateStage && (
            <button
              onClick={onOpenCreateStage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 shrink-0 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tahap WBS Sekarang</span>
            </button>
          )}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#ECE0D0] shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tugas atau anggota..."
            className="w-full pl-10 pr-8 py-2 rounded-2xl bg-[#FAF7F2] border border-[#E8DACB] text-stone-900 text-xs focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stage filter */}
          {stages.length > 0 && (
            <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-2xl border border-[#E8DACB] text-xs">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-transparent text-stone-700 font-medium outline-none cursor-pointer"
              >
                <option value="" className="bg-white text-stone-800">Semua Tahapan WBS</option>
                {stages.map((st) => (
                  <option key={st.id} value={st.id} className="bg-white text-stone-800">
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Member filter */}
          {members.length > 0 && (
            <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-2xl border border-[#E8DACB] text-xs">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="bg-transparent text-stone-700 font-medium outline-none cursor-pointer"
              >
                <option value="" className="bg-white text-stone-800">Semua Anggota</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white text-stone-800">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedStage || selectedMember || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStage('');
                setSelectedMember('');
                setSearchQuery('');
              }}
              className="text-xs text-orange-600 hover:text-orange-700 px-2 py-1 underline font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            tasks={filteredTasks.filter((t) => t.status === col.status)}
            onUpdateStatus={onUpdateStatus}
            onOpenWorkLog={onOpenWorkLog}
            onOpenAddDependency={onOpenAddDependency}
            onDeleteTask={onDeleteTask}
            onOpenCreateTask={onOpenCreateTask}
            onQuickCreateTask={onQuickCreateTask}
            onQuickLogHours={onQuickLogHours}
            onClaimTask={onClaimTask}
            onUpdateDueDate={onUpdateDueDate}
            onEditTask={onEditTask}
            hasStages={stages.length > 0}
            isLeader={isLeader}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
};
