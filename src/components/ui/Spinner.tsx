import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZE = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
} as const;

export function Spinner({ className = '', size = 'md', label }: SpinnerProps) {
  return (
    <div className={`inline-flex items-center gap-2 text-gray-500 ${className}`}>
      <Loader2 className={`${SIZE[size]} animate-spin text-primary`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export default Spinner;
