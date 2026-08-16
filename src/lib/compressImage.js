// Compresses/resizes an image in the browser before upload
// file = the image file to shrink
// maxWidth = biggest width allowed (default 1600px)
// quality = how much to compress it, 0 to 1 (default 0.8 = 80%)
function compressImage(file, maxWidth = 1600, quality = 0.8) {
  // Return a Promise because this work happens asynchronously (takes time)
  // resolve = call this when done successfully
  // reject = call this if something goes wrong
  return new Promise((resolve, reject) => {
    // Create an empty image object (will hold the picture in memory)
    const img = new Image();

    // Create a file reader (used to read the raw file data)
    const reader = new FileReader();

    // When the file has finished being read...
    reader.onload = (e) => {
      // ...use that data as the image source, which starts loading the image
      img.src = e.target.result;
    };

    // When the image has fully loaded and is ready to use...
    img.onload = () => {
      // Create a hidden canvas (a drawing surface) to draw the resized image on
      const canvas = document.createElement("canvas");

      // Get the image's original width and height
      let { width, height } = img;

      // If the image is wider than allowed, shrink it down
      if (width > maxWidth) {
        // Shrink the height by the same ratio so the image doesn't get distorted
        height = (maxWidth / width) * height;

        // Set the new width to the max allowed width
        width = maxWidth;
      }

      // Resize the canvas to match the new (possibly smaller) dimensions
      canvas.width = width;
      canvas.height = height;

      // Get the 2D drawing tool for the canvas
      const ctx = canvas.getContext("2d");

      // Draw the image onto the canvas at the new size
      ctx.drawImage(img, 0, 0, width, height);

      // Convert the canvas drawing into an actual image file (blob)
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };

    // If the image fails to load, fail the Promise
    img.onerror = reject;

    // If reading the file fails, fail the Promise
    reader.onerror = reject;

    // Start the process: read the uploaded file so it can be turned into an image
    reader.readAsDataURL(file);
  });
}

export default compressImage;
