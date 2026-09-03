// app/admin/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import JSZip from "jszip";
import { db, auth } from "@/lib/firebase";

function safeFileName(name, fallback = "photo") {
  const cleaned = (name || fallback)
    .toString()
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);
  return cleaned || fallback;
}

function extensionFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.(jpe?g|png|webp|gif)$/i);
    return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
  } catch {
    return "jpg";
  }
}

async function fetchPhotoBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch photo (${res.status})`);
  return res.blob();
}

function triggerDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "visible" | "hidden"
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && sessionStorage.getItem("admin_authed") === "true") {
        setAuthed(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setError("Wrong password.");
      return;
    }
    try {
      await signInAnonymously(auth);
      sessionStorage.setItem("admin_authed", "true");
      setAuthed(true);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [authed]);

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this photo? This can't be undone.")) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(db, "photos", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleHide = async (id, currentlyHidden) => {
    setBusyId(id);
    try {
      await updateDoc(doc(db, "photos", id), { hidden: !currentlyHidden });
    } catch (err) {
      console.error(err);
      alert("Failed to update. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadOne = async (photo) => {
    setBusyId(photo.id);
    try {
      const blob = await fetchPhotoBlob(photo.url);
      const ext = extensionFromUrl(photo.url);
      const name = safeFileName(photo.guestName, "guest");
      triggerDownload(blob, `${name}-${photo.id.slice(0, 6)}.${ext}`);
    } catch (err) {
      console.error(err);
      alert("Failed to download this photo. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  // derive stats + filtered list from the full photos array
  const totalCount = photos.length;
  const hiddenCount = useMemo(
    () => photos.filter((p) => p.hidden).length,
    [photos],
  );
  const visibleCount = totalCount - hiddenCount;

  const filteredPhotos = useMemo(() => {
    if (filter === "hidden") return photos.filter((p) => p.hidden);
    if (filter === "visible") return photos.filter((p) => !p.hidden);
    return photos;
  }, [photos, filter]);

  const handleDownloadAll = async () => {
    if (filteredPhotos.length === 0) return;
    if (
      !confirm(
        `Download ${filteredPhotos.length} photo(s) as a ZIP? This may take a moment on mobile.`,
      )
    ) {
      return;
    }

    setDownloading(true);
    setDownloadProgress("Preparing…");

    try {
      const zip = new JSZip();
      const usedNames = new Set();

      for (let i = 0; i < filteredPhotos.length; i++) {
        const photo = filteredPhotos[i];
        setDownloadProgress(`Fetching ${i + 1} of ${filteredPhotos.length}…`);

        try {
          const blob = await fetchPhotoBlob(photo.url);
          const ext = extensionFromUrl(photo.url);
          let base = `${String(i + 1).padStart(3, "0")}-${safeFileName(
            photo.guestName,
            "guest",
          )}`;
          let filename = `${base}.${ext}`;
          let n = 2;
          while (usedNames.has(filename)) {
            filename = `${base}-${n}.${ext}`;
            n += 1;
          }
          usedNames.add(filename);
          zip.file(filename, blob);
        } catch (err) {
          console.error(`Skip failed photo ${photo.id}:`, err);
        }
      }

      setDownloadProgress("Building ZIP…");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const stamp = new Date().toISOString().slice(0, 10);
      triggerDownload(zipBlob, `fatin-fazreen-photos-${filter}-${stamp}.zip`);
    } catch (err) {
      console.error(err);
      alert("Failed to build the ZIP. Please try again.");
    } finally {
      setDownloading(false);
      setDownloadProgress("");
    }
  };

  if (!authed) {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(circle at 50% 15%, #14264A 0%, #0A1628 65%)",
        }}
      >
        <div className="invite-card w-full max-w-xs rounded-sm p-6 text-center">
          <p className="text-[#C9A24B] text-xs tracking-[0.3em] mb-4">
            Admin Access
          </p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-transparent border border-[#C9A24B]/40 rounded-sm px-3 py-2.5 mb-3 text-[#F6F1E7] placeholder-[#C9C2B3]/60 text-sm text-center focus:outline-none focus:border-[#C9A24B]"
          />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={handleLogin}
            className="btn-gold w-full text-sm py-2.5 rounded-sm"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] px-4 sm:px-8 py-10"
      style={{
        background:
          "radial-gradient(circle at 50% 15%, #14264A 0%, #0A1628 65%)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link
            href="/"
            className="text-[11px] sm:text-xs px-3 py-1.5 rounded-sm border border-[#C9A24B]/40 text-[#C9A24B] hover:bg-[#C9A24B]/10 transition-colors"
          >
            Main
          </Link>
          <Link
            href="/upload"
            className="text-[11px] sm:text-xs px-3 py-1.5 rounded-sm border border-[#C9A24B]/40 text-[#C9A24B] hover:bg-[#C9A24B]/10 transition-colors"
          >
            Upload
          </Link>
          <Link
            href="/gallery"
            className="text-[11px] sm:text-xs px-3 py-1.5 rounded-sm border border-[#C9A24B]/40 text-[#C9A24B] hover:bg-[#C9A24B]/10 transition-colors"
          >
            Gallery
          </Link>
        </div>

        <div className="text-center mb-6">
          <p className="text-[#C9A24B] text-xs tracking-[0.3em] mb-2">
            Fatin &amp; Fazreen
          </p>
          <h1 className="font-display text-2xl text-[#F6F1E7]">
            Manage Photos
          </h1>
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-6">
          <div className="text-center">
            <p className="text-[#F6F1E7] text-xl sm:text-2xl font-display">
              {totalCount}
            </p>
            <p className="text-[#C9C2B3] text-[10px] sm:text-xs tracking-wide uppercase">
              Total
            </p>
          </div>
          <div className="w-px h-8 bg-[#C9A24B]/30" />
          <div className="text-center">
            <p className="text-[#F6F1E7] text-xl sm:text-2xl font-display">
              {visibleCount}
            </p>
            <p className="text-[#C9C2B3] text-[10px] sm:text-xs tracking-wide uppercase">
              Visible
            </p>
          </div>
          <div className="w-px h-8 bg-[#C9A24B]/30" />
          <div className="text-center">
            <p className="text-[#F6F1E7] text-xl sm:text-2xl font-display">
              {hiddenCount}
            </p>
            <p className="text-[#C9C2B3] text-[10px] sm:text-xs tracking-wide uppercase">
              Hidden
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center justify-center gap-2">
            {[
              { key: "all", label: "All" },
              { key: "visible", label: "Visible" },
              { key: "hidden", label: "Hidden" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`text-[11px] sm:text-xs px-3.5 py-1.5 rounded-sm border transition-colors ${
                  filter === opt.key
                    ? "bg-[#C9A24B] text-[#0A1628] border-[#C9A24B] font-medium"
                    : "border-[#C9A24B]/40 text-[#C9A24B] hover:bg-[#C9A24B]/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloading || filteredPhotos.length === 0}
            className="btn-gold text-[11px] sm:text-xs px-4 py-2 rounded-sm disabled:opacity-50"
          >
            {downloading
              ? downloadProgress || "Downloading…"
              : `Download All`}
          </button>
        </div>

        {filteredPhotos.length === 0 && (
          <p className="text-center text-[#C9C2B3] text-sm">
            {filter === "hidden"
              ? "No hidden photos."
              : filter === "visible"
                ? "No visible photos."
                : "No photos yet."}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="invite-card rounded-sm overflow-hidden p-2 flex flex-col h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.guestName}
                className="w-full aspect-square object-cover rounded-sm mb-2"
              />

              <div className="flex-1 mb-2">
                <p className="text-[#C9A24B] text-xs font-medium truncate">
                  {photo.guestName || "Anonymous"}
                </p>
                {photo.guestWish && (
                  <p className="text-[#C9C2B3] text-[11px] italic leading-snug line-clamp-3">
                    &quot;{photo.guestWish}&quot;
                  </p>
                )}
                {photo.hidden && (
                  <p className="text-[10px] text-yellow-500/80 mt-1 tracking-wide">
                    HIDDEN FROM GALLERY
                  </p>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleToggleHide(photo.id, photo.hidden)}
                    disabled={busyId === photo.id || downloading}
                    className="flex-1 text-[11px] py-1.5 rounded-sm border border-[#C9A24B]/50 text-[#C9A24B] disabled:opacity-50"
                  >
                    {busyId === photo.id
                      ? "..."
                      : photo.hidden
                        ? "Unhide"
                        : "Hide"}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={busyId === photo.id || downloading}
                    className="flex-1 text-[11px] py-1.5 rounded-sm border border-red-400/50 text-red-400 disabled:opacity-50"
                  >
                    {busyId === photo.id ? "..." : "Delete"}
                  </button>
                </div>
                <button
                  onClick={() => handleDownloadOne(photo)}
                  disabled={busyId === photo.id || downloading}
                  className="w-full text-[11px] py-1.5 rounded-sm border border-[#C9A24B]/50 text-[#C9A24B] disabled:opacity-50"
                >
                  {busyId === photo.id ? "..." : "Download"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
