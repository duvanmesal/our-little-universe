import { useEffect, useState } from 'react';
import { parseStarProgress, resetChapterProgress } from '../data/constellations';

const key = 'our-little-universe:stars:v1';
const preferenceKey = 'our-little-universe:remember-stars';

export function useConstellationProgress() {
  const [visited, setVisited] = useState<string[]>([]);
  const [remember, setRemember] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    try {
      const enabled = localStorage.getItem(preferenceKey) !== 'false';
      setRemember(enabled);
      if (enabled) setVisited(parseStarProgress(localStorage.getItem(key)));
    } catch {
      setUnavailable(true);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded || unavailable) return;
    try {
      localStorage.setItem(preferenceKey, String(remember));
      if (remember) localStorage.setItem(key, JSON.stringify(visited));
      else localStorage.removeItem(key);
    } catch {
      setUnavailable(true);
    }
  }, [visited, remember, loaded, unavailable]);
  return {
    visited,
    remember,
    setRemember,
    unavailable,
    replay: (chapterId: string) =>
      setVisited((current) => resetChapterProgress(current, chapterId)),
    visit: (id: string) =>
      setVisited((current) => (current.includes(id) ? current : [...current, id])),
  };
}
