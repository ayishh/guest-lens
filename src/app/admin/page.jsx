// app/admin/page.jsx
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [busyId, setBusyId] = useState(null);

  // listen for real Firebase auth state, not just sessionStorage
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
      await signInAnonymously(auth); // this makes request.auth != null in Firestore rules
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
          {error && (
            <p className="text-red-400 text-xs mb-3">{error}</p>
          )}
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
        <div className="text-center mb-8">
          <p className="text-[#C9A24B] text-xs tracking-[0.3em] mb-2">
            Fatin &amp; Fazreen
          </p>
          <h1 className="font-display text-2xl text-[#F6F1E7]">
            Manage Photos ({photos.length})
          </h1>
        </div>

        {photos.length === 0 && (
          <p className="text-center text-[#C9C2B3] text-sm">No photos yet.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="invite-card rounded-sm overflow-hidden p-2 flex flex-col h-full"
            >
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
                  <p className="text-[#C9C2B3] text-[11px] italic truncate">
                    "{photo.guestWish}"
                  </p>
                )}
                {photo.hidden && (
                  <p className="text-[10px] text-yellow-500/80 mt-1 tracking-wide">
                    HIDDEN FROM GALLERY
                  </p>
                )}
              </div>

              <div className="mt-auto flex gap-1.5">
                <button
                  onClick={() => handleToggleHide(photo.id, photo.hidden)}
                  disabled={busyId === photo.id}
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
                  disabled={busyId === photo.id}
                  className="flex-1 text-[11px] py-1.5 rounded-sm border border-red-400/50 text-red-400 disabled:opacity-50"
                >
                  {busyId === photo.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}