import { useState, useEffect } from 'react';

// Subscribe to a CSS media query and re-render when it changes.
export function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange(); // sync in case the query changed between render and effect
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// Breakpoints used across the dashboard.
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsNarrow = () => useMediaQuery('(max-width: 1100px)');
