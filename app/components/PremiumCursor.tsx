"use client";

import { useEffect, useRef, useState } from "react";

type Ripple = { id: string; x: number; y: number };
type TargetMeta = {
  el: HTMLElement | null;
  cx: number;
  cy: number;
};

const INTERACTIVE_SELECTOR =
  'a,button,[role="button"],input,textarea,select,[data-cursor="interactive"]';

export default function PremiumCursor() {
  const [enabled, setEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const mouseRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef<TargetMeta>({ el: null, cx: 0, cy: 0 });

  const dotEl = useRef<HTMLDivElement | null>(null);
  const ringEl = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const pointerMq = window.matchMedia("(pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setEnabled(pointerMq.matches);
      setReduceMotion(motionMq.matches);
    };

    update();
    pointerMq.addEventListener("change", update);
    motionMq.addEventListener("change", update);
    return () => {
      pointerMq.removeEventListener("change", update);
      motionMq.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    let lastLog = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastLog < 600) return;
      lastLog = now;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName.toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || target.isContentEditable) return;
      if (target.closest(INTERACTIVE_SELECTOR)) return;
      const style = window.getComputedStyle(target);
      if (style.cursor === "text") {
        // eslint-disable-next-line no-console
        console.warn("Cursor text detected:", tag, target.className);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const setIdle = () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      setIsIdle(false);
      idleTimerRef.current = window.setTimeout(() => setIsIdle(true), 2000);
    };

    const computeTargetMeta = (el: HTMLElement | null) => {
      if (!el) {
        targetRef.current = { el: null, cx: 0, cy: 0 };
        setHoveringInteractive(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      targetRef.current = {
        el,
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
      setHoveringInteractive(true);
    };

    const onMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIdle();
    };

    const onDown = (e: PointerEvent) => {
      setIsDown(true);
      setIdle();
      if (reduceMotion) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ripple = { id, x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-5), ripple]);
    };

    const onUp = () => setIsDown(false);

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      computeTargetMeta(interactive);
    };

    const onOut = (e: PointerEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      const stillInteractive = related?.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      computeTargetMeta(stillInteractive);
    };

    const onScrollOrResize = () => {
      const { el } = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      targetRef.current.cx = rect.left + rect.width / 2;
      targetRef.current.cy = rect.top + rect.height / 2;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerout", onOut);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [enabled, reduceMotion]);

  useEffect(() => {
    if (!enabled) return;
    const magnetRadius = 90;
    const pull = 0.35;
    const lerp = reduceMotion ? 1 : 0.22;

    const tick = () => {
      const mouse = mouseRef.current;
      let targetX = mouse.x;
      let targetY = mouse.y;
      let strength = 0;

      if (!reduceMotion && targetRef.current.el) {
        const dx = mouse.x - targetRef.current.cx;
        const dy = mouse.y - targetRef.current.cy;
        const dist = Math.hypot(dx, dy);
        if (dist < magnetRadius) {
          const t = 1 - dist / magnetRadius;
          strength = t * t * (3 - 2 * t);
          targetX = mouse.x + (targetRef.current.cx - mouse.x) * (pull * strength);
          targetY = mouse.y + (targetRef.current.cy - mouse.y) * (pull * strength);
        }
      }

      ringRef.current.x += (targetX - ringRef.current.x) * lerp;
      ringRef.current.y += (targetY - ringRef.current.y) * lerp;

      const dot = dotEl.current;
      const ring = ringEl.current;
      if (dot) {
        const dotScale = isDown ? 1.15 : 1;
        dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      }
      if (ring) {
        const baseScale = hoveringInteractive ? 0.92 : 1 - 0.06 * strength;
        const downScale = isDown ? 0.88 : 1;
        const scale = baseScale * downScale;
        ring.style.transform = `translate3d(${ringRef.current.x}px, ${ringRef.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, hoveringInteractive, isDown, reduceMotion]);

  if (!enabled) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 ${isIdle ? "opacity-25" : "opacity-100"}`}
      aria-hidden="true"
    >
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute h-4 w-4 rounded-full border border-white/40 cursor-ripple"
          style={{ left: r.x, top: r.y }}
          onAnimationEnd={() =>
            setRipples((prev) => prev.filter((item) => item.id !== r.id))
          }
        />
      ))}

      <div
        ref={dotEl}
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-white/80 shadow-[0_0_12px_rgba(99,102,241,0.55)]"
      />
      <div
        ref={ringEl}
        className={`absolute left-0 top-0 h-8 w-8 rounded-full border ${
          hoveringInteractive ? "border-white/60" : "border-white/30"
        } shadow-[0_0_18px_rgba(99,102,241,0.35)]`}
      />
    </div>
  );
}
