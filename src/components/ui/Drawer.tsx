import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Slot render cạnh title (vd: badge status). */
  titleExtra?: ReactNode;
  /** Footer cố định dưới cùng (vd: action buttons). */
  footer?: ReactNode;
  /** Tailwind width class — mặc định 'w-[640px]'. */
  widthClass?: string;
  children: ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  titleExtra,
  footer,
  widthClass = 'w-full md:w-[640px]',
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative ${widthClass} max-w-full bg-white shadow-xl flex flex-col h-full`}
      >
        {title && (
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
              {titleExtra}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded shrink-0"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Drawer;
