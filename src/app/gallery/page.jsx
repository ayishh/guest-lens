"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Masonry from "@/components/masonry.jsx";
import CoupleNames from "@/components/CoupleName.jsx";
import PageReveal from "@/components/PageReveal.jsx";
import WeddingPetals from "@/components/WeddingPetals.jsx";

function measureHeight(url, targetWidth = 400) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      resolve(Math.round(targetWidth * ratio));
    };
    img.onerror = () => resolve(500);
    img.src = url;
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function addVariety(baseHeight, id) {
  const hash = hashString(id);
  const factor = 0.65 + ((hash % 100) / 100) * 0.85;
  const varied = Math.round(baseHeight * factor);
  return Math.min(560, Math.max(220, varied));
}

function optimizedUrl(url, width = 500) {
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const withHeights = await Promise.all(
        docs
          .filter((doc) => !doc.hidden)
          .map(async (doc) => {
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
          }),
      );

      setItems(withHeights);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="wedding-bg min-h-[100dvh] w-full flex justify-center px-4 sm:px-8 py-10 sm:py-14">
      <WeddingPetals count={6} />

      <div className="w-full max-w-5xl">
        <PageReveal>
          <div data-reveal className="text-center mb-8 sm:mb-10">
            <CoupleNames className="text-xs tracking-[0.3em] sm:tracking-[0.35em] mb-2" />
            <p className="font-script text-[#E8D5A3] text-xl sm:text-2xl mb-1">
              Momen-momen majlis
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-[#F6F1E7] mb-0.5">
              Album
            </h1>
            {/* <p className="text-[#C9C2B3] text-[11px] tracking-[0.18em] uppercase">
              As se
            </p> */}
            <div className="divider-ornament">
              <span className="line" />
              <span className="gem">✦</span>
              <span className="line" />
            </div>
          </div>
        </PageReveal>

        {loading && (
          <p className="text-center text-[#C9C2B3] text-sm">
            Memuatkan… / Loading…
          </p>
        )}

        {!loading && items.length === 0 && (
          <p className="text-center text-[#C9C2B3] text-sm px-4 leading-relaxed">
            Belum ada gambar. Sila mulakan dengan selfie handsome/cantik.
            <br />
            <span className="text-[12px]">
              No photos yet — break the ice with a flattering selfie.
            </span>
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
