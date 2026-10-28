import React from 'react';
import { Users, AlertTriangle, CheckCircle2, Flame, Zap, Calendar, Check, Target } from 'lucide-react';

export const WorkloadWidget = ({ workload }) => {
  if (!workload || workload.length === 0) {
    return (
      <div className="bg-white border border-[#ECE0D0] rounded-3xl p-6 text-center text-stone-400 text-sm">
        Belum ada data beban tugas anggota tim.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#ECE0D0] rounded-3xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Distribusi Tugas & Beban Anggota Tim
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Pantau pembagian tugas aktif, progres penyelesaian, dan kepatuhan tenggat hari antarmahasiswa.
          </p>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          Redis In-Memory Cache Aktif
        </span>
      </div>

      <div className="space-y-4">
        {workload.map((member) => {
          const activeTasks = parseInt(member.active_tasks || 0, 10);
          const doneTasks = parseInt(member.done_tasks || 0, 10);
          const totalTasks = parseInt(member.total_tasks || 0, 10) || (activeTasks + doneTasks);
          const urgentTasks = parseInt(member.urgent_tasks || 0, 10);
          const completionPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          const isOverloaded = activeTasks >= 4;
          const isUrgent = urgentTasks > 0;

          return (
            <div
              key={member.user_id}
              className="p-4.5 rounded-2xl bg-[#FAF7F2] border border-[#ECE0D0] hover:border-orange-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      member.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                    }
                    alt={member.name}
                    className="w-10 h-10 rounded-full ring-2 ring-orange-200 bg-orange-50 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{member.name}</h4>
                    <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                        {doneTasks} Selesai
                      </span>
                      <span>•</span>
                      <span className="font-medium text-stone-700">
                        {activeTasks} Tugas Aktif
                      </span>
                      {urgentTasks > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            {urgentTasks} Mendekati Deadline
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-stone-900">
                    {activeTasks} Tugas Aktif
                  </div>
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                    {totalTasks > 0 ? `Dari ${totalTasks} Total Tugas` : 'Belum Ada Tugas'}
                  </div>
                </div>
              </div>

              {/* Progress bar based on completed tasks */}
              <div className="w-full bg-[#EFE5D9] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionPercent === 100
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500'
                  }`}
                  style={{ width: `${totalTasks > 0 ? completionPercent : 0}%` }}
                />
              </div>

              {/* Status footer message */}
              <div className="flex items-center justify-between mt-2.5 text-[11px]">
                {isUrgent ? (
                  <span className="text-amber-800 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Ada tugas aktif mendekati tenggat deadline
                  </span>
                ) : isOverloaded ? (
                  <span className="text-amber-800 flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Beban tugas tinggi ({activeTasks} tugas aktif berjalan)
                  </span>
                ) : totalTasks > 0 && activeTasks === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Seluruh tugas yang ditugaskan telah selesai!
                  </span>
                ) : activeTasks > 0 ? (
                  <span className="text-stone-600 flex items-center gap-1 font-semibold">
                    <Target className="w-3.5 h-3.5 text-orange-500" />
                    Pengerjaan tugas berjalan sesuai target
                  </span>
                ) : (
                  <span className="text-stone-400 flex items-center gap-1 font-medium">
                    Belum ada tugas yang ditugaskan
                  </span>
                )}

                <span className="text-stone-600 text-[11px] font-bold">
                  Selesai: {completionPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
