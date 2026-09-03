"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Soft floating petals for a romantic wedding atmosphere.
 * Purely decorative — pointer-events none, sits behind page content.
 */
export default function WeddingPetals({ count = 8 }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const petals = Array.from(root.querySelectorAll(".petal"));
    const tweens = [];

    petals.forEach((petal, i) => {
      const duration = 16 + Math.random() * 10;
      const delay = i * 0.9 + Math.random() * 3;
      const startX = 5 + Math.random() * 90;
      const drift = (20 + Math.random() * 40) * (i % 2 === 0 ? 1 : -1);
      const size = 6 + Math.random() * 10;

      gsap.set(petal, {
        left: `${startX}%`,
        top: "-10%",
        width: size,
        height: size * 1.25,
        opacity: 0,
        rotate: Math.random() * 40,
        x: 0,
        y: 0,
      });

      const tl = gsap.timeline({ repeat: -1, delay });
      tl.to(petal, {
        y: "115vh",
        x: drift,
        rotate: `+=${140 + Math.random() * 80}`,
        duration,
        ease: "none",
      });
      tl.to(
        petal,
        {
          opacity: 0.45,
          duration: duration * 0.15,
          ease: "power1.out",
        },
        0,
      );
      tl.to(
        petal,
        {
          opacity: 0,
          duration: duration * 0.2,
          ease: "power1.in",
        },
        duration * 0.8,
      );

      tweens.push(tl);
    });

    return () => tweens.forEach((t) => t.kill());
  }, [count]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="petal absolute" />
      ))}
    </div>
  );
}
