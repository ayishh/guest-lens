"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Fades/slides children in on mount. Mark child elements with
 * `data-reveal` for staggered entrance; unmarked children animate as one.
 */
export default function PageReveal({ children, className = "" }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll("[data-reveal]");
    const els = targets.length > 0 ? targets : [root];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
