import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} bg-white border border-[#F3E5D8] rounded-3xl shadow-2xl shadow-orange-950/10 overflow-hidden z-10 transition-all transform animate-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between px-4.5 sm:px-6 py-3.5 sm:py-4 border-b border-[#F5EBE1] bg-[#FAF7F2]/60">
          <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4.5 sm:p-6 max-h-[85vh] overflow-y-auto text-stone-800">{children}</div>
      </div>
    </div>
  );
};
