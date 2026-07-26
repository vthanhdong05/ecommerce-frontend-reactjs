import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Optional small helper line below the value. */
  hint?: string;
  /** Tailwind background color class for the icon container. */
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  iconBg = 'bg-primary/10 text-primary',
}: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
