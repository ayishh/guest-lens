"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CoupleNames({ className = "" }) {
  const router = useRouter();
  const [taps, setTaps] = useState(0);
  const tapTimeout = useRef(null);

  const handleSecretTap = () => {
    const next = taps + 1;
    setTaps(next);

    clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setTaps(0), 1500);

    if (next >= 3) {
      router.push("/admin");
    }
  };

  return (
    <p
      onClick={handleSecretTap}
      className={`text-[#C9A24B] cursor-default select-none ${className}`}
    >
      Fatin &amp; Fazreen
    </p>
  );
}
