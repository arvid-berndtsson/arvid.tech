import { useEffect, useState } from "react";

/**
 * Thin progress bar at top of viewport showing scroll position (guided scrolling).
 * Respects prefers-reduced-motion: hidden when user prefers reduced motion.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (reduceMotion) return null;

  return (
    <div
      className="fixed left-0 top-0 z-50 h-0.5 bg-amber-600 dark:bg-amber-500"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
      style={{ width: `${progress}%` }}
    />
  );
}
