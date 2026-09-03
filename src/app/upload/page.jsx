"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import compressImage from "@/lib/compressImage";
import CoupleNames from "@/components/CoupleName.jsx";
import PageReveal from "@/components/PageReveal.jsx";
import WeddingPetals from "@/components/WeddingPetals.jsx";

export default function UploadPage() {
  const router = useRouter();

  const [files, setFiles] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [guestWish, setGuestWish] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 3);
    setFiles(selected);
    e.target.value = "";
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Sila pilih sekurang-kurangnya 1 gambar.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(
          `Memuat naik ${i + 1} / ${files.length}…`,
        );

        const compressedFile = await compressImage(file);

        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await res.json();

        if (!data.secure_url) {
          throw new Error(data.error?.message || "Upload failed");
        }

        await addDoc(collection(db, "photos"), {
          url: data.secure_url,
          guestName: guestName || "Anonymous",
          guestWish: guestWish || "",
          createdAt: serverTimestamp(),
        });
      }

      setFiles([]);
      router.push("/gallery");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Ada masalah. Sila cuba lagi.",
      );
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="wedding-bg min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:p-6">
      <WeddingPetals count={7} />

      <PageReveal className="w-full max-w-md">
        <div className="invite-card w-full rounded-sm p-5 sm:p-8 relative">
          <div className="absolute top-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-l border-[#C9A24B]" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-r border-[#C9A24B]" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-l border-[#C9A24B]" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-r border-[#C9A24B]" />

          <div data-reveal className="text-center mb-6 px-2">
            <CoupleNames className="text-xs tracking-[0.3em] sm:tracking-[0.35em] mb-2" />
            <p className="font-script text-[#E8D5A3] text-xl sm:text-2xl mb-0.5">
              Dari Lensa Tetamu
            </p>
            <h1 className="font-display text-xl sm:text-2xl text-[#F6F1E7] mb-0.5 leading-snug">
              Kongsi Gambar Anda
            </h1>
            {/* <p className="text-[#C9C2B3] text-[11px] tracking-[0.18em] uppercase mb-1">
              Share a Few Snapshots
            </p> */}
            <div className="divider-ornament">
              <span className="line" />
              <span className="gem">✦</span>
              <span className="line" />
            </div>
            <p className="text-[#F6F1E7] text-[13px] sm:text-sm leading-relaxed">
              Gambar pengantin, suasana majlis, dan satu gambar OOTD anda.
              Maksimum 3 gambar.
            </p>
            {/* <p className="text-[#C9C2B3] text-[12px] sm:text-[13px] leading-relaxed mt-1.5">
              Funny moments, resigned faces, and one flattering shot of you. Up
              to 3 photos.
            </p> */}
          </div>

          <div data-reveal>
            <input
              type="text"
              placeholder="Nama Tetamu"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-transparent border border-[#C9A24B]/40 rounded-sm px-3 py-3 sm:py-2 mb-3 text-[#F6F1E7] placeholder-[#C9C2B3]/60 text-base sm:text-sm focus:outline-none focus:border-[#C9A24B]"
            />

            <input
              type="text"
              placeholder="Ucapan"
              value={guestWish}
              onChange={(e) => setGuestWish(e.target.value)}
              className="w-full bg-transparent border border-[#C9A24B]/40 rounded-sm px-3 py-3 sm:py-2 mb-4 text-[#F6F1E7] placeholder-[#C9C2B3]/60 text-base sm:text-sm focus:outline-none focus:border-[#C9A24B]"
            />

            <label className="block w-full mb-4">
              <span className="sr-only">Pilih gambar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full text-[13px] sm:text-sm text-[#C9C2B3] file:mr-3 file:py-2.5 sm:file:py-2 file:px-4 file:rounded-sm file:border file:border-[#C9A24B]/50 file:bg-transparent file:text-[#C9A24B] file:text-[13px] sm:file:text-sm active:file:bg-[#C9A24B]/10 sm:hover:file:bg-[#C9A24B]/10 file:cursor-pointer"
              />
            </label>

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
                {files.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrls[i]}
                      alt="preview"
                      className="w-full aspect-square object-cover rounded-sm border border-[#C9A24B]/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center
                                 rounded-full bg-[#0A1628] border border-[#C9A24B]/60 text-[#C9A24B]
                                 text-xs leading-none"
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-red-400 text-[13px] sm:text-sm mb-4">{error}</p>
            )}

            {uploading && progress && (
              <p className="text-[#E8D5A3] text-[12px] sm:text-xs mb-3 text-center tracking-wide">
                {progress}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-gold w-full font-medium tracking-wide text-base sm:text-sm py-3.5 sm:py-2.5 rounded-sm disabled:opacity-50"
            >
              {uploading ? "Memuat naik…" : "Muat Naik "}
            </button>
          </div>
        </div>
      </PageReveal>
    </div>
  );
}
