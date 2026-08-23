// specify that this file need to run on browser, not just on the server
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import compressImage from "@/lib/compressImage";

export default function UploadPage() {
  const router = useRouter();

  // list of states that are stored and can be updated
  const [files, setFiles] = useState([]);             // store the list of image file that user want to upload
  const [guestName, setGuestName] = useState("");     // store the name the guest type in
  const [guestWish, setGuestWish] = useState("");     // store the wish the guest type in
  const [uploading, setUploading] = useState(false);  // track whether an upload is in progress(use for loading spinner)
  const [error, setError] = useState("");             // store an error message if something goes wrong


  // This function runs whenever user picks file from a file input
  const handleFileChange = (e) => {
    // convert the browser object into array and takes only the first 3 file from that array
    const selected = Array.from(e.target.files).slice(0, 3);

    // update the files state with this new list of files (max 3)
    setFiles(selected);
  };

  // A function that handles upload. It uses async because it uses await to wait for the upload to finish
  const handleUpload = async () => {
    // Safety check : if no files were selected,  show an error message and return
    if (files.length === 0) {
      setError("Please select at least 1 photo.");
      return;
    }

    // Before start the upload, set the uploading state to true so that user can see the loading spinner
    setUploading(true);

    // Clear any previous error
    setError("");

    try {
      // Loop over the files and upload them one by one
      for (const file of files) {
        // Compress before uploading
        const compressedFile = await compressImage(file);

        // build a form  data object. This format is required by Cloudinary
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        );

        // send the image to Cloudinary via POST request
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        // convert Cloudinary response into usable JavaSript object and logs it into consol
        const data = await res.json();
        console.log("Cloudinary response:", data);

        // check if the upload was successful. Cloudinary returns a secure url on success
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

      // Upload finished — go straight to the gallery instead of showing a
      // "thank you" screen first.
      router.push("/gallery");
    } catch (err) {
      // catch error if something went wrong
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");

      // finally, turn off the loading spinner
    } finally {
      setUploading(false);
    }
  };

  

  return (
    <div className="wedding-bg min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:p-6">
      <div className="invite-card w-full max-w-md rounded-sm p-5 sm:p-8 relative">
        {/* corner ornaments */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-l border-[#C9A24B]" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-r border-[#C9A24B]" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-l border-[#C9A24B]" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b border-r border-[#C9A24B]" />

        <div className="text-center mb-6 px-2">
          <p className="text-[#C9A24B] text-xs tracking-[0.3em] sm:tracking-[0.35em] mb-2">
            Fatin &amp; Fazreen
          </p>
          <h1 className="font-display text-xl sm:text-2xl text-[#F6F1E7] mb-1 leading-snug">
            Share Your Photos
          </h1>
          <div className="flex items-center justify-center gap-2 my-3">
            <span className="h-px w-8 sm:w-10 bg-[#C9A24B]/50" />
            <span className="text-[#C9A24B] text-xs">✦</span>
            <span className="h-px w-8 sm:w-10 bg-[#C9A24B]/50" />
          </div>
          <p className="text-[#C9C2B3] text-[13px] sm:text-sm">
            Up to 3 photos, no login needed.
          </p>
        </div>

        <input
          type="text"
          placeholder="Your name (optional)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full bg-transparent border border-[#C9A24B]/40 rounded-sm px-3 py-3 sm:py-2 mb-4 text-[#F6F1E7] placeholder-[#C9C2B3]/60 text-base sm:text-sm focus:outline-none focus:border-[#C9A24B]"
        />

        <input
          type="text"
          placeholder="Your wish (optional)"
          value={guestWish}
          onChange={(e) => setGuestWish(e.target.value)}
          className="w-full bg-transparent border border-[#C9A24B]/40 rounded-sm px-3 py-3 sm:py-2 mb-4 text-[#F6F1E7] placeholder-[#C9C2B3]/60 text-base sm:text-sm focus:outline-none focus:border-[#C9A24B]"
        />

        <label className="block w-full mb-4">
          <span className="sr-only">Choose photos</span>
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
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full aspect-square object-cover rounded-sm border border-[#C9A24B]/40"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-[13px] sm:text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-gold w-full font-medium tracking-wide text-base sm:text-sm py-3.5 sm:py-2.5 rounded-sm disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Photos"}
        </button>
      </div>
    </div>
  );
}