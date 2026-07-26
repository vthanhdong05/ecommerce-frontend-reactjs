import { useEffect } from 'react';

const APP_NAME = 'VTDhub';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    return () => {
      // Reset title khi unmount (optional)
    };
  }, [title]);
}
