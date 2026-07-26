/**
 * Simple event bus for access-token changes.
 *
 * axiosClient emits the new token (or null on logout/clear).
 * authSlice subscribes and decodes JWT to keep Redux in sync.
 *
 * This avoids polling localStorage and prevents stale `permissions[]`
 * after a refresh-token round-trip.
 */
type Listener = (token: string | null) => void;

const listeners = new Set<Listener>();

export const sessionBus = {
  emit(token: string | null): void {
    listeners.forEach((l) => l(token));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
