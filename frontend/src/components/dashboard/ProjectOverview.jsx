import React, { useState, useMemo } from 'react';
import { RoleBadge, StatusBadge, PriorityBadge } from '../ui/Badge';
import {
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  Plus,
  TrendingUp,
  Flag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Clock,
} from 'lucide-react';

const toDateKey = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const ProjectOverview = ({
  project,
  stages = [],
  tasks = [],
  members = [],
  assets = [],
  dashboardData,
  isLeader = false,
  onNavigateTab,
  onCopyInviteCode,
  copiedCode = false,
  onOpenCreateTask,
  onOpenCreateTaskWithDate,
  onOpenCreateStage,
  onOpenAssetModal,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteProject,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const projectDeadlineKey = useMemo(
    () => toDateKey(project?.deadline),
    [project?.deadline]
  );

  const initialDate = useMemo(() => {
    if (project?.deadline) {
      const d = new Date(project.deadline);
      if (!isNaN(d.getTime())) return d;
    }
    return today;
  }, [project?.deadline, today]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [agendaFilter, setAgendaFilter] = useState('all'); // 'all', 'upcoming', 'overdue', 'done'

  // Calculations
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Project Deadline text and countdown
  const deadlineFormatted = project?.deadline
    ? new Date(project.deadline).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Belum ditentukan';

  const projectRemainingDays = useMemo(() => {
    if (!project?.deadline) return null;
    const d1 = new Date(todayKey);
    const d2 = new Date(toDateKey(project.deadline));
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hari Ini';
    if (diff === 1) return 'Besok';
    if (diff > 1) return `Sisa ${diff} Hari`;
    return `Lewat ${Math.abs(diff)} Hari`;
  }, [project?.deadline, todayKey]);

  // Active tasks due within 7 days or overdue
  const activeUrgentTasksCount = useMemo(() => {
    const now = new Date(todayKey);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    return tasks.filter((t) => {
      if (t.status === 'Done' || !t.due_date) return false;
      const tDate = new Date(toDateKey(t.due_date));
      return tDate <= in7Days;
    }).length;
  }, [tasks, todayKey]);

  const criticalTasks = dashboardData?.criticalPath || [];

  // Group tasks by due date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (task.due_date) {
        const key = toDateKey(task.due_date);
        if (key) {
          if (!map[key]) map[key] = [];
          map[key].push(task);
        }
      }
    });
    return map;
  }, [tasks]);

  // Calendar month cells generator
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInCurrentMonth = lastDayOfMonth.getDate();

    // Monday is 0, Sunday is 6
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const cells = [];

    // Trailing days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, day);
      const key = toDateKey(prevDate);
      cells.push({
        date: prevDate,
        dateKey: key,
        dayNumber: day,
        isCurrentMonth: false,
        tasks: tasksByDate[key] || [],
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const cellDate = new Date(currentYear, currentMonth, day);
      const key = toDateKey(cellDate);
      cells.push({
        date: cellDate,
        dateKey: key,
        dayNumber: day,
        isCurrentMonth: true,
        tasks: tasksByDate[key] || [],
      });
    }

    // Leading days from next month
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      const key = toDateKey(nextDate);
      cells.push({
        date: nextDate,
        dateKey: key,
        dayNumber: day,
        isCurrentMonth: false,
        tasks: tasksByDate[key] || [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, tasksByDate]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDateKey(todayKey);
  };

  const handleJumpToDeadline = () => {
    if (project?.deadline) {
      const d = new Date(project.deadline);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
        setSelectedDateKey(projectDeadlineKey);
      }
    }
  };

  // Filtered tasks for right-column agenda list
  const selectedDateTasks = useMemo(() => {
    if (!selectedDateKey) return [];
    return tasksByDate[selectedDateKey] || [];
  }, [selectedDateKey, tasksByDate]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => Boolean(t.due_date))
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [tasks]);

  const filteredUpcomingTasks = useMemo(() => {
    if (selectedDateKey) {
      return selectedDateTasks;
    }

    const now = new Date(todayKey);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    return upcomingTasks.filter((t) => {
      const tDate = new Date(toDateKey(t.due_date));
      if (agendaFilter === 'done') return t.status === 'Done';
      if (agendaFilter === 'overdue') return t.status !== 'Done' && tDate < now;
      if (agendaFilter === 'upcoming') {
        return t.status !== 'Done' && tDate >= now && tDate <= in7Days;
      }
      return true;
    });
  }, [selectedDateKey, selectedDateTasks, upcomingTasks, agendaFilter, todayKey]);

  const getRelativeDueText = (dateString, isDone) => {
    if (!dateString) return null;
    const key = toDateKey(dateString);
    if (isDone) return 'Selesai';
    if (key === todayKey) return 'Hari Ini';

    const d1 = new Date(todayKey);
    const d2 = new Date(key);
    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Besok';
    if (diffDays === -1) return 'Lewat 1 hari';
    if (diffDays < -1) return `Lewat ${Math.abs(diffDays)} hari`;
    return `Sisa ${diffDays} hari`;
  };

  return (
    <div className="space-y-3">
      {/* 3-Column Executive Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* ========================================================== */}
        {/* KOLOM KIRI: Identitas Proyek, Aksi Cepat, & Tahapan WBS   */}
        {/* ========================================================== */}
        <div className="lg:col-span-3 space-y-3">
          {/* Card 1: Identitas & Progres Capstone */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm space-y-3">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-orange-500" />
                <span className="truncate max-w-[110px]">{project.course_name}</span>
              </span>
              <RoleBadge role={isLeader ? 'leader' : 'member'} />
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-base font-black text-stone-900 tracking-tight leading-snug line-clamp-2" title={project.title}>
                {project.title}
              </h2>
              {project.description && (
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 font-medium leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Capstone Progress Box */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-600 flex items-center gap-1 text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                  Progres Capstone
                </span>
                <span className="font-black text-stone-900">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium pt-0.5">
                <span>{doneTasks} dari {totalTasks} selesai</span>
                <span className="text-rose-600 font-bold">{projectRemainingDays || 'Atur tenggat'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tahapan WBS Snapshot (Maksimal 4, selebihnya disembunyikan) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-stone-900">
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span>Tahapan WBS ({stages.length})</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('wbs')}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {stages.slice(0, 4).map((stage) => {
                const stageTasks = tasks.filter((t) => t.stage_id === stage.id);
                const done = stageTasks.filter((t) => t.status === 'Done').length;
                const percent = stageTasks.length > 0 ? Math.round((done / stageTasks.length) * 100) : 0;

                return (
                  <div key={stage.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-800 truncate max-w-[130px]" title={stage.name}>
                        {stage.stage_order}. {stage.name}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 shrink-0">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                      <div className="bg-orange-500 h-1 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}

              {/* Jika lebih dari 4, sembunyikan dan tampilkan tombol ++ / lihat detail agar layout tidak memanjang kebawah */}
              {stages.length > 4 && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('wbs')}
                  className="w-full py-1.5 px-2 mt-1 rounded-xl bg-orange-50 hover:bg-orange-100/90 text-orange-700 text-[11px] font-bold border border-orange-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Lihat seluruh tahapan WBS di tab WBS"
                >
                  <span>+{stages.length - 4} Tahap Lainnya</span>
                  <span>•</span>
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {stages.length === 0 && (
                <div className="text-center py-3 text-[11px] text-stone-400">
                  Belum ada tahap WBS.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* KOLOM TENGAH LEBAR: Menu Metrik Di Atas + Kalender Canvas */}
        {/* ========================================================== */}
        <div className="lg:col-span-6 space-y-3">
          {/* 1. Bar Menu / Metric Pills Di Atas Kalender */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Metric 1 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Progres</div>
                <div className="text-sm font-black text-stone-900 truncate">{progressPercent}%</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Flag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Tenggat</div>
                <div className="text-xs font-black text-stone-900 truncate" title={deadlineFormatted}>
                  {projectRemainingDays || 'Atur'}
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Mendekati</div>
                <div className="text-sm font-black text-stone-900 truncate">{activeUrgentTasksCount} Target</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Tahap & Tim</div>
                <div className="text-xs font-black text-stone-900 truncate">
                  {stages.length} Tahap • {members.length} Org
                </div>
              </div>
            </div>
          </div>

          {/* 2. Kalender Canvas Utama */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
            {/* Kalender Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100/80 text-orange-700 flex items-center justify-center shrink-0 font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-tight">
                    Canvas Kalender Target
                  </h3>
                  <p className="text-[10px] text-stone-500 font-medium">
                    Pilih tanggal untuk melihat atau menjadwalkan target tugas
                  </p>
                </div>
              </div>

              {/* Month Controls */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  Hari Ini
                </button>
                {project?.deadline && (
                  <button
                    type="button"
                    onClick={handleJumpToDeadline}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                    title={`Tenggat: ${projectDeadlineKey}`}
                  >
                    <Flag className="w-3 h-3 text-rose-600" />
                    <span>Tenggat</span>
                  </button>
                )}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-md text-stone-600 hover:text-orange-600 hover:bg-white transition-colors cursor-pointer"
                    title="Bulan sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-black text-stone-900 min-w-[100px] text-center">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-md text-stone-600 hover:text-orange-600 hover:bg-white transition-colors cursor-pointer"
                    title="Bulan berikutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Day Names Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-stone-400 uppercase tracking-wider">
              {DAY_NAMES.map((name, i) => (
                <div key={name} className={i >= 5 ? 'text-amber-600' : ''}>
                  {name}
                </div>
              ))}
            </div>

            {/* Days Grid (Month View) */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                const isToday = cell.dateKey === todayKey;
                const isSelected = cell.dateKey === selectedDateKey;
                const isProjectDeadline = cell.dateKey === projectDeadlineKey;
                const hasTasks = cell.tasks.length > 0;
                const doneCount = cell.tasks.filter((t) => t.status === 'Done').length;
                const hasOverdue = hasTasks && cell.tasks.some((t) => t.status !== 'Done' && cell.dateKey < todayKey);

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    className={`min-h-[50px] sm:min-h-[54px] p-1 sm:p-1.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                      cell.isCurrentMonth
                        ? 'bg-white hover:bg-orange-50/40 text-stone-800'
                        : 'bg-stone-50/40 text-stone-400 opacity-60'
                    } ${
                      isSelected
                        ? 'ring-2 ring-orange-500 border-orange-400 bg-orange-50/30 shadow-xs'
                        : 'border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isToday
                            ? 'bg-orange-500 text-white font-black'
                            : isSelected
                            ? 'bg-orange-100 text-orange-800'
                            : ''
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {isProjectDeadline && (
                        <span title="Tenggat Akhir Proyek" className="p-0.5 rounded-md bg-rose-100 text-rose-700 shrink-0">
                          <Flag className="w-3 h-3 text-rose-600" />
                        </span>
                      )}

                      {hasTasks && (
                        <span
                          className={`text-[9px] font-extrabold px-1 rounded-md ${
                            doneCount === cell.tasks.length
                              ? 'bg-emerald-100 text-emerald-800'
                              : hasOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {cell.tasks.length}
                        </span>
                      )}
                    </div>

                    {/* Task preview mini pill */}
                    <div className="space-y-0.5 mt-0.5">
                      {cell.tasks.slice(0, 1).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[8.5px] px-1 py-0.2 rounded truncate font-medium border leading-tight ${
                            t.status === 'Done'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-75'
                              : hasOverdue
                              ? 'bg-rose-50 text-rose-800 border-rose-200 font-semibold'
                              : 'bg-slate-50 text-stone-700 border-slate-200'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {cell.tasks.length > 1 && (
                        <div className="text-[8px] text-stone-400 font-bold px-0.5">
                          +{cell.tasks.length - 1} target
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-stone-500 font-medium border-t border-slate-100">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Hari Ini</span>
              </span>
              <span className="flex items-center gap-1">
                <Flag className="w-2.5 h-2.5 text-rose-600" />
                <span>Tenggat Proyek</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Target Selesai</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Lewat Tenggat</span>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* KOLOM KANAN: Target Tanggal Terpilih & Jalur Kritis        */}
        {/* ========================================================== */}
        <div className="lg:col-span-3 space-y-3">
          {/* Card 1: Target Tanggal Terpilih / Agenda Target */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  {selectedDateKey ? 'Target Tanggal' : 'Agenda Mendatang'}
                </h3>
                <p className="text-[10px] text-stone-500 font-medium">
                  {selectedDateKey
                    ? new Date(selectedDateKey).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Target tugas 7 hari ke depan'}
                </p>
              </div>
              {selectedDateKey && (
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(null)}
                  className="text-[10px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                >
                  Lihat Semua
                </button>
              )}
            </div>

            {/* Filter mode if all view */}
            {!selectedDateKey && (
              <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-xl border border-slate-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setAgendaFilter('all')}
                  className={`flex-1 py-0.5 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                    agendaFilter === 'all' ? 'bg-orange-500 text-white shadow-2xs' : 'text-stone-600 hover:bg-white'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setAgendaFilter('upcoming')}
                  className={`flex-1 py-0.5 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                    agendaFilter === 'upcoming' ? 'bg-orange-500 text-white shadow-2xs' : 'text-stone-600 hover:bg-white'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setAgendaFilter('overdue')}
                  className={`flex-1 py-0.5 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                    agendaFilter === 'overdue' ? 'bg-orange-500 text-white shadow-2xs' : 'text-stone-600 hover:bg-white'
                  }`}
                >
                  Terlewat
                </button>
              </div>
            )}

            {/* Task list in right column */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
              {filteredUpcomingTasks.map((task) => {
                const isDone = task.status === 'Done';
                const relativeText = getRelativeDueText(task.due_date, isDone);
                const isOverdue = !isDone && task.due_date && toDateKey(task.due_date) < todayKey;

                return (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl bg-slate-50 border transition-all ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                        : isOverdue
                        ? 'border-rose-200 bg-rose-50/30'
                        : 'border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white text-stone-600 border border-slate-200 truncate max-w-[100px]">
                        {task.stage_name || 'WBS'}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {relativeText}
                      </span>
                    </div>

                    <h4
                      onClick={() => onEditTask && onEditTask(task)}
                      className={`text-xs font-bold text-stone-900 line-clamp-2 leading-snug cursor-pointer hover:text-orange-600 transition-colors ${
                        isDone ? 'line-through text-stone-400' : ''
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200/80 text-[10px]">
                      <span className="text-stone-500 font-medium truncate max-w-[90px]">
                        {task.assigned_to_name ? task.assigned_to_name.split(' ')[0] : 'Belum ditugaskan'}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        {isLeader && onEditTask && (
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="p-0.5 text-stone-400 hover:text-orange-600 cursor-pointer"
                            title="Edit tugas"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        {onUpdateTaskStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateTaskStatus(task.id, isDone ? 'In Progress' : 'Done')}
                            className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                : 'bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 border border-slate-200'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>{isDone ? 'Selesai' : 'Tandai'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredUpcomingTasks.length === 0 && (
                <div className="py-4 text-center text-xs text-stone-400 space-y-1.5">
                  <Calendar className="w-6 h-6 mx-auto text-stone-300" />
                  <p className="text-[11px]">
                    {selectedDateKey ? 'Tidak ada target di tanggal ini.' : 'Belum ada target mendekati tenggat.'}
                  </p>
                  {isLeader && onOpenCreateTaskWithDate && (
                    <button
                      type="button"
                      onClick={() => onOpenCreateTaskWithDate(selectedDateKey || todayKey)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Buat Target</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Jalur Kritis Capstone (Critical Path) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-stone-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Jalur Kritis ({criticalTasks.length})</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Analisis</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-0.5">
              {criticalTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-stone-900 truncate max-w-[130px]" title={task.title}>
                      {task.title}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500">
                    <span className="truncate max-w-[100px]">{task.stage_name}</span>
                    {task.due_date && (
                      <span className="font-semibold text-rose-700 bg-white px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                        {new Date(task.due_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {criticalTasks.length === 0 && (
                <div className="text-center py-3 text-[11px] text-stone-400">
                  Tidak ada jalur kritis yang mendesak.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
