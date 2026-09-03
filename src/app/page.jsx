"use client";

import Link from "next/link";
import CoupleNames from "@/components/CoupleName.jsx";
import PageReveal from "@/components/PageReveal.jsx";
import WeddingPetals from "@/components/WeddingPetals.jsx";

export default function HomePage() {
  return (
    <div className="wedding-bg min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:p-6">
      <WeddingPetals count={9} />

      <PageReveal className="w-full max-w-md">
        <div className="invite-card w-full rounded-sm p-6 sm:p-8 relative text-center">
          <div className="absolute top-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-l border-[#C9A24B]" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-r border-[#C9A24B]" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-l border-[#C9A24B]" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-r border-[#C9A24B]" />

          <div data-reveal>
            <CoupleNames className="text-xs tracking-[0.3em] sm:tracking-[0.35em] mb-3" />
          </div>

          {/* <p
            data-reveal
            className="font-script text-[#E8D5A3] text-2xl sm:text-3xl mb-1 leading-none"
          >
            Sumbangan anda
          </p> */}

          <h1
            data-reveal
            className="font-display text-3xl sm:text-4xl text-[#F6F1E7] mb-0.5 leading-snug"
          >
            Dari Lensa Tetamu
          </h1>
          {/* <p
            data-reveal
            className="text-[#C9C2B3] text-[11px] sm:text-xs tracking-[0.2em] uppercase mb-1"
          >
            Through Your Eyes
          </p> */}

          <div data-reveal className="divider-ornament">
            <span className="line" />
            <span className="gem">✦</span>
            <span className="line" />
          </div>

          <div data-reveal className="mb-8 px-1 space-y-3">
            <p className="text-[#F6F1E7] text-[13px] sm:text-sm leading-relaxed">
              Gambar acah-acah professional kami serah pada photographer. Kami nak tengok 
               the real story dari persektif anda. Share gambar pengantin, suasana majlis,
               dan sekurang-kurangnya satu gambar OOTD anda (tanda hadir!). 
              
            </p>
            {/* <p className="text-[#C9C2B3] text-[12px] sm:text-[13px] leading-relaxed">
              The polished, professional shots we leave to the photographer.
              What we want is the real story from your angle — the funny
              moments, the resigned faces, and at least one handsome/pretty
              photo of yourself. No excuses — please upload!
            </p> */}
          </div>

          <div data-reveal className="flex flex-col gap-3">
            <Link
              href="/upload"
              className="btn-gold font-medium tracking-wide text-base sm:text-sm py-3.5 sm:py-3 rounded-sm"
            >
              Upload
            </Link>
          </div>
        </div>
      </PageReveal>
    </div>
  );
}
