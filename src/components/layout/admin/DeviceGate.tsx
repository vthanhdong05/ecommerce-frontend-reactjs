import type { ReactNode } from 'react';
import { useDeviceGuard } from '../../../hooks/useDeviceGuard';
import { InvalidDeviceScreen } from '../../admin/InvalidDeviceScreen';

interface DeviceGateProps {
  children: ReactNode;
}

/**
 * Renders `children` only when viewport ≥ 768px (md breakpoint).
 * Shows InvalidDeviceScreen otherwise. SSR-safe (returns null on first render).
 */
export function DeviceGate({ children }: DeviceGateProps) {
  const allowed = useDeviceGuard();
  if (allowed === null) return null;
  if (!allowed) return <InvalidDeviceScreen />;
  return <>{children}</>;
}

export default DeviceGate;
