import React from 'react';
import { Crown, User } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Critical: 'bg-rose-50 text-rose-700 border-rose-200/80',
    High: 'bg-orange-50 text-orange-700 border-orange-200/80',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Low: 'bg-stone-100 text-stone-600 border-stone-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        styles[priority] || styles.Medium
      }`}
    >
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    'To Do': 'bg-stone-100 text-stone-700 border-stone-200',
    'In Progress': 'bg-orange-50 text-orange-700 border-orange-200',
    Blocked: 'bg-amber-50 text-amber-800 border-amber-200',
    Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
        styles[status] || styles['To Do']
      }`}
    >
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const isLeader = role === 'leader';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
        isLeader
          ? 'bg-orange-50 text-orange-700 border-orange-200/90'
          : 'bg-stone-100 text-stone-600 border-stone-200'
      }`}
    >
      {isLeader ? (
        <>
          <Crown className="w-3 h-3 text-orange-600" />
          <span>Project Leader</span>
        </>
      ) : (
        <>
          <User className="w-3 h-3 text-stone-500" />
          <span>Member</span>
        </>
      )}
    </span>
  );
};
