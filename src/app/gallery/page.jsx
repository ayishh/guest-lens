"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Masonry from "@/components/masonry.jsx";

// Measures a photo's real height (scaled to a standard width) so the
// masonry grid can lay it out proportionally instead of guessing.
function measureHeight(url, targetWidth = 400) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      resolve(Math.round(targetWidth * ratio));
    };
    img.onerror = () => resolve(500); // fallback if a photo fails to load
    img.src = url;
  });
}

// Turns a photo's id into the same "random" number every time — this is
// what keeps a photo's size stable across refreshes instead of reshuffling.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Nudges the real height taller or shorter, purely for visual variety.
// Photos crop to fill their box (background-size: cover), so this never
// stretches or distorts a photo — it just shows a bit more or less of it.
function addVariety(baseHeight, id) {
  const hash = hashString(id);
  const factor = 0.65 + (hash % 100 / 100) * 0.85; // roughly 0.65x–1.5x
  const varied = Math.round(baseHeight * factor);
  return Math.min(560, Math.max(220, varied)); // keep it within a sane range
}

// Asks Cloudinary to resize/compress on the fly, so the gallery doesn't
// download full-resolution photos just to show small thumbnails.
function optimizedUrl(url, width = 500) {
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));

    // onSnapshot keeps the gallery live — new uploads appear automatically
    // without anyone needing to refresh the page.
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    const withHeights = await Promise.all(
      docs.map(async (doc) => {
        const displayUrl = optimizedUrl(doc.url, 500);
        const measured = await measureHeight(displayUrl);
        return {
          id: doc.id,
          img: displayUrl,
          url: doc.url,
          height: addVariety(measured, doc.id),
          guestName: doc.guestName || "Anonymous",
          guestWish: doc.guestWish || "",
        };
      })
    );

      setItems(withHeights);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center px-4 sm:px-8 py-10 sm:py-14"
      style={{
        background:
          "radial-gradient(circle at 50% 15%, #14264A 0%, #0A1628 65%)",
      }}
    >
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[#C9A24B] text-xs tracking-[0.3em] sm:tracking-[0.35em] mb-2">
            Fatin &amp; Fazreen
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-[#F6F1E7]">
            Gallery
          </h1>
        </div>

        {loading && (
          <p className="text-center text-[#C9C2B3] text-sm">
            Loading photos...
          </p>
        )}

        {!loading && items.length === 0 && (
          <p className="text-center text-[#C9C2B3] text-sm">
            No photos shared yet. Be the first to upload one!
          </p>
        )}

        {items.length > 0 && (
          <Masonry
            items={items}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover
            hoverScale={0.95}
            blurToFocus
            colorShiftOnHover={false}
          />
        )}
      </div>
    </div>
  );
}