"use client";
import { useEffect, useRef } from "react";

export default function ShapeGrid() {
  const ref = useRef(null);
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const onMouse = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const cell = 58, gap = 2;
      const cols = Math.ceil(c.width / (cell + gap));
      const rows = Math.ceil(c.height / (cell + gap));
      for (let r = 0; r < rows; r++) {
        for (let cl = 0; cl < cols; cl++) {
          const cx = cl * (cell + gap) + cell / 2;
          const cy = r * (cell + gap) + cell / 2;
          const dx = mouse.current.x - cx, dy = mouse.current.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inf = Math.max(0, 1 - dist / 160);
          const a = 0.035 + inf * 0.18;
          const s = (cell * 0.25) * (1 + inf * 0.4);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.globalAlpha = a;
          ctx.fillStyle = "#141413";
          const t = (r + cl) % 3;
          if (t === 0) {
            ctx.fillRect(-s / 2, -s / 2, s, s);
          } else if (t === 1) {
            ctx.beginPath();
            ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(s / 2, 0);
            ctx.lineTo(0, s / 2);
            ctx.lineTo(-s / 2, 0);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
