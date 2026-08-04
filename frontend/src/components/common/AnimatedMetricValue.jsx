import { useEffect, useState } from 'react';

export default function AnimatedMetricValue({ value, duration = 0.8, formatter }) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const [displayValue, setDisplayValue] = useState(safeValue);

  useEffect(() => {
    const start = displayValue;
    const end = safeValue;
    if (start === end) return undefined;

    const startTime = performance.now();

    const animate = (timestamp) => {
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = start + (end - start) * eased;
      setDisplayValue(next);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeValue, duration]);

  const roundedValue = Math.round(displayValue);
  if (typeof formatter === 'function') {
    return formatter(roundedValue);
  }
  return roundedValue.toLocaleString();
}
