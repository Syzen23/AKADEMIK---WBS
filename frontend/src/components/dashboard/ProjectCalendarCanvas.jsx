import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  ArrowRight,
  Plus,
  Filter,
  Check,
  User,
  Pencil,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../ui/Badge';

// Helper to format Date to YYYY-MM-DD in local time
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

export const ProjectCalendarCanvas = ({
  project,
  tasks = [],
  stages = [],
  isLeader = false,
  onOpenCreateTaskWithDate,
  onUpdateTaskStatus,
  onEditTask,
}) => {
  // Determine initial calendar month based on project deadline or today
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

  // Group tasks by their due date key
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

  // Generate calendar days for current month
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInCurrentMonth = lastDayOfMonth.getDate();

    // In JS, getDay(): 0 is Sunday, 1 is Monday ...
    // We adjust so Monday is 0, Sunday is 6
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

    // Leading days from next month to fill grid (multiple of 7)
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

  // Tasks for the selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDateKey) return [];
    return tasksByDate[selectedDateKey] || [];
  }, [selectedDateKey, tasksByDate]);

  // Sorted list of upcoming/urgent tasks for the agenda list
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

  // Helper for relative due text
  const getRelativeDueText = (dateString, isDone) => {
    if (!dateString) return null;
    const key = toDateKey(dateString);
    if (isDone) return 'Selesai';
    if (key === todayKey) return 'Hari ini';

    const d1 = new Date(todayKey);
    const d2 = new Date(key);
    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Besok';
    if (diffDays === -1) return 'Lewat 1 hari';
    if (diffDays < -1) return `Lewat ${Math.abs(diffDays)} hari`;
    return `Sisa ${diffDays} hari`;
  };

  return (
    <div className="bg-white border border-[#ECE0D0] rounded-3xl p-3.5 sm:p-7 shadow-xs space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-[#F2E8DC]">
        <div>
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-500" />
            <span>Canvas Kalender & Target Progres</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pantau tenggat hari pengerjaan tugas capstone tanpa perhitungan jam yang rumit.
          </p>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7F2] hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-[#E8DACB] transition-colors cursor-pointer"
          >
            Hari Ini
          </button>

          {project?.deadline && (
            <button
              type="button"
              onClick={handleJumpToDeadline}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
              title={`Tenggat Proyek: ${projectDeadlineKey}`}
            >
              <Flag className="w-3.5 h-3.5 text-rose-600" />
              <span>Tenggat Proyek</span>
            </button>
          )}

          <div className="flex items-center bg-[#FAF7F2] border border-[#E8DACB] rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-stone-600 hover:text-orange-600 hover:bg-white transition-colors cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-black text-stone-900 min-w-[125px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-stone-600 hover:text-orange-600 hover:bg-white transition-colors cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Agenda/Targets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar Canvas (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Day Names Row */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-stone-400 uppercase tracking-wider py-1">
            {DAY_NAMES.map((name, i) => (
              <div key={name} className={i >= 5 ? 'text-amber-600' : ''}>
                {name}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell) => {
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDateKey;
              const isProjectDeadline = cell.dateKey === projectDeadlineKey;
              const hasTasks = cell.tasks.length > 0;
              const doneCount = cell.tasks.filter((t) => t.status === 'Done').length;
              const isAllDone = hasTasks && doneCount === cell.tasks.length;
              const hasOverdue =
                hasTasks &&
                cell.tasks.some(
                  (t) => t.status !== 'Done' && cell.dateKey < todayKey
                );

              return (
                <div
                  key={cell.dateKey}
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  className={`min-h-[64px] sm:min-h-[92px] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? 'bg-white hover:bg-orange-50/40 text-stone-800'
                      : 'bg-stone-50/50 text-stone-400 opacity-60'
                  } ${
                    isSelected
                      ? 'ring-2 ring-orange-500 border-orange-400 bg-orange-50/30 shadow-xs'
                      : 'border-[#EFE5D9] hover:border-orange-300'
                  }`}
                >
                  {/* Top Bar inside cell: Day number & Markers */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isToday
                          ? 'bg-orange-500 text-white shadow-2xs font-black'
                          : isSelected
                          ? 'bg-orange-100 text-orange-800'
                          : ''
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Project Deadline Indicator */}
                    {isProjectDeadline && (
                      <span
                        title="Tenggat Akhir Proyek Capstone"
                        className="p-1 rounded-md bg-rose-100 text-rose-700 animate-pulse shrink-0"
                      >
                        <Flag className="w-3 h-3 text-rose-600" />
                      </span>
                    )}

                    {/* Task count pill if many */}
                    {hasTasks && cell.tasks.length > 2 && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                        {cell.tasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Pills / Indicators */}
                  <div className="space-y-1 mt-1">
                    {cell.tasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        title={`${t.title} (${t.status})`}
                        className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-semibold border ${
                          t.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-80'
                            : hasOverdue
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : t.status === 'In Progress'
                            ? 'bg-orange-50 text-orange-800 border-orange-200 font-bold'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}

                    {cell.tasks.length > 2 && (
                      <div className="text-[9px] text-stone-400 font-bold px-1">
                        +{cell.tasks.length - 2} lagi...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-stone-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Hari Ini</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Flag className="w-3 h-3 text-rose-600" />
              <span>Tenggat Proyek</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Target Selesai</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Lewat Tenggat</span>
            </span>
          </div>
        </div>

        {/* Right Column: Target & Agenda Details (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#FAF7F2] border border-[#ECE0D0] rounded-2xl p-4.5 space-y-4">
          {/* Header & Mode Switch */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DACB]">
            <div>
              <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                {selectedDateKey ? 'Target Tanggal Terpilih' : 'Agenda Target Mendatang'}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                {selectedDateKey ? (
                  new Date(selectedDateKey).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                ) : (
                  'Daftar deadline tugas capstone'
                )}
              </p>
            </div>

            {selectedDateKey && (
              <button
                type="button"
                onClick={() => setSelectedDateKey(null)}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
              >
                Lihat Semua
              </button>
            )}
          </div>

          {/* Quick Filter tabs if in 'All' mode */}
          {!selectedDateKey && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8DACB] text-[11px]">
              <button
                type="button"
                onClick={() => setAgendaFilter('all')}
                className={`flex-1 py-1 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  agendaFilter === 'all'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setAgendaFilter('upcoming')}
                className={`flex-1 py-1 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  agendaFilter === 'upcoming'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setAgendaFilter('overdue')}
                className={`flex-1 py-1 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  agendaFilter === 'overdue'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                Terlewat
              </button>
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredUpcomingTasks.map((task) => {
              const isDone = task.status === 'Done';
              const relativeText = getRelativeDueText(task.due_date, isDone);
              const isOverdue =
                !isDone &&
                task.due_date &&
                toDateKey(task.due_date) < todayKey;

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl bg-white border transition-all ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/20 opacity-85'
                      : isOverdue
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-[#E8DACB] hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EE] text-stone-600 border border-[#EFE4D6] truncate max-w-[120px]">
                      {task.stage_name || 'Tahap WBS'}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : relativeText === 'Hari ini' || relativeText === 'Besok'
                          ? 'bg-amber-50 text-amber-800 border-amber-200 font-extrabold'
                          : 'bg-[#FAF5EE] text-stone-600 border-[#EFE4D6]'
                      }`}
                    >
                      {relativeText}
                    </span>
                  </div>

                  <h4
                    className={`text-xs font-bold text-stone-900 leading-snug mb-2 ${
                      isDone ? 'line-through text-stone-500' : ''
                    }`}
                  >
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F5ECE1] text-[11px]">
                    {/* Assignee / Pelaksana */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {task.assigned_to_name ? (
                        <div className="flex items-center gap-1">
                          <img
                            src={
                              task.assigned_to_avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigned_to_name}`
                            }
                            alt={task.assigned_to_name}
                            className="w-5 h-5 rounded-full ring-1 ring-orange-200 bg-orange-50 shrink-0"
                          />
                          <span className="text-[10px] font-semibold text-stone-700 truncate max-w-[80px]">
                            {task.assigned_to_name.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">
                          Belum ditugaskan
                        </span>
                      )}
                    </div>

                    {/* Action buttons: Edit & Done Toggle */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLeader && onEditTask && (
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                          title="Edit detail tugas"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onUpdateTaskStatus && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateTaskStatus(
                              task.id,
                              isDone ? 'In Progress' : 'Done'
                            )
                          }
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            isDone
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              : 'bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800'
                          }`}
                          title={isDone ? 'Batalkan selesai' : 'Tandai selesai'}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isDone ? 'Selesai' : 'Tandai'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredUpcomingTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-stone-300" />
                <p>
                  {selectedDateKey
                    ? 'Tidak ada target tugas pada tanggal ini.'
                    : 'Belum ada tugas dengan tenggat waktu.'}
                </p>
                {isLeader && onOpenCreateTaskWithDate && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenCreateTaskWithDate(selectedDateKey || todayKey)
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Buat Target di Tanggal Ini</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
