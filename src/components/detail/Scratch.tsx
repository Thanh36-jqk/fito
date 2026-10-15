"use client";

import { useEffect, useRef, useState } from "react";

/* Spoiler che kiểu vé số cào. Miết để cào, hoặc bấm link để hiện luôn. */
export function Scratch({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = box.current!;
    const canvas = cv.current!;
    const r = el.getBoundingClientRect();
    const dpr = devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    const c = canvas.getContext("2d", { willReadFrequently: true })!;
    c.scale(dpr, dpr);
    const g = c.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, "#C9CCD9");
    g.addColorStop(0.5, "#F2F3F8");
    g.addColorStop(1, "#9EA2B6");
    c.fillStyle = g;
    c.fillRect(0, 0, r.width, r.height);
    c.strokeStyle = "rgba(0,0,0,.08)";
    c.lineWidth = 2;
    for (let x = -r.height; x < r.width; x += 10) {
      c.beginPath();
      c.moveTo(x, r.height);
      c.lineTo(x + r.height, 0);
      c.stroke();
    }
    c.fillStyle = "#3A3D52";
    c.font = "800 15px Nunito, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("CÀO ĐỂ ĐỌC SPOILER", r.width / 2, r.height / 2);
    c.globalCompositeOperation = "destination-out";

    let down = false;
    let moves = 0;
    const scratch = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      c.beginPath();
      c.arc(e.clientX - b.left, e.clientY - b.top, 20, 0, 7);
      c.fill();
      if (++moves % 8 === 0) {
        const d = c.getImageData(0, 0, canvas.width, canvas.height).data;
        let clear = 0;
        let n = 0;
        for (let i = 3; i < d.length; i += 64) {
          n++;
          if (d[i] === 0) clear++;
        }
        if (clear / n > 0.5) setGone(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      down = true;
      canvas.setPointerCapture(e.pointerId);
      scratch(e);
    };
    const onMove = (e: PointerEvent) => down && scratch(e);
    const onUp = () => (down = false);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <>
      <div ref={box} className="spoiler">
        <p>{children}</p>
        <canvas ref={cv} aria-hidden style={gone ? { opacity: 0, pointerEvents: "none" } : undefined} />
      </div>
      {!gone && (
        <button type="button" className="reveal" onClick={() => setGone(true)}>
          Có spoiler. Cào để đọc hoặc bấm vào đây
        </button>
      )}
    </>
  );
}
