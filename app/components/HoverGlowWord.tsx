import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type HoverGlowWordProps = {
  text: string;
  className?: string;
};

export default function HoverGlowWord({ text, className = "" }: HoverGlowWordProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const spanRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const centersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const motionOkRef = useRef(true);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;
    motionOkRef.current = !(reduceMotion || coarsePointer);
    setMotionOk(motionOkRef.current);
  }, []);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      if (!bounds.width) return;
      centersRef.current = spanRefs.current.map((span) => {
        if (!span) return 0;
        const rect = span.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        return (center - bounds.left) / bounds.width;
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  function setGlowFor(mx: number) {
    const centers = centersRef.current;
    spanRefs.current.forEach((span, i) => {
      if (!span) return;
      const cx = centers[i] ?? 0;
      const dist = Math.abs(mx - cx);
      const sigma = 0.18;
      const intensity = Math.exp(-(dist * dist) / sigma);
      span.style.setProperty("--g", intensity.toFixed(3));
    });
  }

  function handleMove(e: React.MouseEvent<HTMLSpanElement>) {
    if (!motionOkRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const mx = bounds.width ? (e.clientX - bounds.left) / bounds.width : 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      setGlowFor(Math.min(1, Math.max(0, mx)));
    });
  }

  function handleLeave() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    spanRefs.current.forEach((span) => {
      if (!span) return;
      span.style.setProperty("--g", "0");
    });
  }

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {text.split("").map((ch, idx) => (
        <span
          key={`${ch}-${idx}`}
          ref={(el) => {
            spanRefs.current[idx] = el;
          }}
          className="relative inline-block text-transparent bg-clip-text [background:inherit]"
          style={{
            "--g": 0,
            textShadow: "0 0 1px rgba(125, 211, 252, calc(var(--g) * 0.25))",
            filter:
              "brightness(calc(1 + var(--g) * 0.25)) saturate(calc(1 + var(--g) * 0.2)) contrast(calc(1 + var(--g) * 0.05))",
            transition: motionOk
              ? "filter 140ms ease, text-shadow 140ms ease"
              : "none",
          } as CSSProperties}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
