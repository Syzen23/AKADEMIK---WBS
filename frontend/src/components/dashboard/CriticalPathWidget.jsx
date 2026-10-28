import React from 'react';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { Clock, Calendar, ShieldAlert } from 'lucide-react';

export const CriticalPathWidget = ({ criticalPath }) => {
  if (!criticalPath || criticalPath.length === 0) {
    return (
      <div className="bg-white border border-[#ECE0D0] rounded-3xl p-6 text-center text-stone-500 text-sm">
        Tidak ada tugas kritis yang mendesak saat ini. Semua tugas jalur kritis telah selesai atau belum memiliki deadline.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#ECE0D0] rounded-3xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            3 Tugas Jalur Kritis (Critical Path Bottleneck)
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Tugas prioritas tinggi yang paling menentukan keberhasilan tenggat akhir capstone.
          </p>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-bold">
          Top 3 Prioritas Utama
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criticalPath.map((task, index) => {
          const hoursUntilDue = parseFloat(task.hours_until_due || 0);
          const daysLeft = Math.ceil(hoursUntilDue / 24);
          const isUrgent = daysLeft <= 3;

          return (
            <div
              key={task.id}
              className="relative p-5 rounded-2xl bg-[#FAF7F2] border border-[#ECE0D0] hover:border-orange-300 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="w-6 h-6 rounded-xl bg-orange-100 text-orange-700 text-xs font-extrabold flex items-center justify-center border border-orange-200">
                    #{index + 1}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>

                <h4 className="text-sm font-bold text-stone-900 line-clamp-2 mb-2 leading-snug">
                  {task.title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                  <span className="font-semibold text-stone-700 bg-white border border-[#E8DACB] px-2 py-0.5 rounded-lg text-[11px]">
                    {task.stage_name || 'WBS'}
                  </span>
                  <span>•</span>
                  <span className="font-medium">
                    {task.assigned_to_name ? task.assigned_to_name.split(' ')[0] : 'Belum ditugaskan'}
                  </span>
                </div>
              </div>

              {/* Deadline alert footer */}
              <div
                className={`pt-3 border-t border-[#EAE0D2] flex items-center justify-between text-[11px] font-bold ${
                  isUrgent ? 'text-rose-700' : 'text-amber-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {daysLeft > 0 ? `Sisa ${daysLeft} Hari` : 'Tenggat Terlewati!'}
                  </span>
                </div>
                <StatusBadge status={task.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
