"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./BrandLoader.module.css";

interface BrandLoaderProps {
  active: boolean;
  onComplete?: () => void;
}

// Helper to compute circumference for a given radius
const circ = (r: number) => 2 * Math.PI * r;

export default function BrandLoader({ active, onComplete }: BrandLoaderProps) {
  const [stage, setStage] = useState<"idle" | "loading" | "loaded" | "newPage">("idle");

  useEffect(() => {
    if (!active) {
      setStage("idle");
      return;
    }

    setStage("loading");
    const startDelay = 100; // start quickly
    const loadedDelay = startDelay + 400; // show layers sooner so they're visible
    const finishDelay = loadedDelay + 1300; // allow ~1.3s for layer animation before exit

    const t1 = setTimeout(() => setStage("loaded"), loadedDelay);
    const t2 = setTimeout(() => {
      setStage("newPage");
      onComplete?.();
    }, finishDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, onComplete]);

  // Layer spec roughly matching the SCSS map (radius, circumference, angle, width, alpha)
  const layers = useMemo(
    () => [
      { r: 70, angle: -30, w: 15, a: 0.5 },
      { r: 120, angle: -60, w: 20, a: 0.3 },
      { r: 180, angle: -70, w: 40, a: 0.8 },
      { r: 240, angle: -90, w: 20, a: 0.6 },
      { r: 300, angle: -20, w: 30, a: 0.5 },
      { r: 380, angle: -80, w: 45, a: 0.2 },
      { r: 450, angle: -10, w: 75, a: 1.0 },
      { r: 540, angle: -70, w: 250, a: 0.5 },
    ],
    []
  );

  return (
    <div
      className={[
        styles.root,
        stage === "idle" ? styles.hidden : "",
        stage === "loaded" ? styles.loaded : "",
        stage === "newPage" ? styles.newPage : "",
      ].join(" ")}
    >
      <div className={styles.container}>
        <svg className="loader" viewBox="0 0 100 100" overflow="visible">
          <g className="core">
            <circle className="path" cx="50" cy="50" r="1" fill="none" />
          </g>
          <g className="spinner">
            <circle className="path" cx="50" cy="50" r="20" fill="none" />
          </g>
          {layers.map((L, idx) => (
            <g className={`layer layer-${idx + 1}`} key={idx}>
              <circle
                className="path"
                cx="50"
                cy="50"
                r={L.r}
                fill="none"
                style={{
                  // custom properties used by CSS animation
                  // @ts-ignore - CSS variables allowed
                  "--c": `${circ(L.r)}`,
                  // @ts-ignore
                  "--angle": `${L.angle}`,
                  // @ts-ignore
                  "--w": `${L.w}`,
                  // @ts-ignore
                  "--alpha": `${L.a}`,
                } as any}
              />
            </g>
          ))}
        </svg>
      </div>
      <div className={styles.overlayWhite} />
    </div>
  );
}
