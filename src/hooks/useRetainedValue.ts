import { useEffect, useState } from 'react';

/** Keep the outgoing view mounted long enough to finish its exit transition. */
export function useRetainedValue<T>(value: T, duration: number, instant = false) {
  const [retained, setRetained] = useState(value);
  useEffect(() => {
    if (Object.is(retained, value)) return;
    if (instant || retained === null) {
      setRetained(value);
      return;
    }
    const timer = setTimeout(() => setRetained(value), duration);
    return () => clearTimeout(timer);
  }, [value, retained, duration, instant]);
  return { value: instant ? value : retained, exiting: !instant && !Object.is(value, retained) };
}
