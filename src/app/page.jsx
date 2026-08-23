import Link from "next/link";
import CoupleNames from "@/components/CoupleName.jsx";

export default function HomePage() {
  return (
    <div className="wedding-bg min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:p-6">
      <div className="invite-card w-full max-w-md rounded-sm p-6 sm:p-8 relative text-center">

        {/* corner ornaments */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-l border-[#C9A24B]" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-r border-[#C9A24B]" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-l border-[#C9A24B]" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-r border-[#C9A24B]" />
  
        <CoupleNames className="text-xs tracking-[0.3em] sm:tracking-[0.35em] mb-2" />

        <h1 className="font-display text-2xl sm:text-3xl text-[#F6F1E7] mb-1 leading-snug">
          Guest's Lens
        </h1>

        <div className="flex items-center justify-center gap-2 my-3">
          <span className="h-px w-8 sm:w-10 bg-[#C9A24B]/50" />
          <span className="text-[#C9A24B] text-xs">✦</span>
          <span className="h-px w-8 sm:w-10 bg-[#C9A24B]/50" />
        </div>

        <p className="text-[#C9C2B3] text-[13px] sm:text-sm leading-relaxed mb-8 px-2">
          Thank you for celebrating with us! Share your photos from the day,
          or browse what everyone else has captured.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/upload"
            className="btn-gold font-medium tracking-wide text-base sm:text-sm py-3.5 sm:py-3 rounded-sm"
          >
            Upload Photos
          </Link>

          {/* <Link
            href="/gallery"
            className="btn-gold-outline font-medium tracking-wide text-base sm:text-sm py-3.5 sm:py-3 rounded-sm"
          >
            View Gallery
          </Link> */}
        </div>
      </div>
    </div>
  );
}