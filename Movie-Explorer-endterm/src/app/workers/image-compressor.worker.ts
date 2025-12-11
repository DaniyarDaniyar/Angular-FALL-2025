/// <reference lib="webworker" />

self.onmessage = async function(e: MessageEvent) {
  // Use the default values from e.data, but provide fallbacks
  const { file, maxWidth = 800, quality = 0.8 } = e.data;

  if (!(file instanceof File) && !(file instanceof Blob)) {
    self.postMessage({ error: 'Invalid file or blob provided.' });
    return;
  }

  try {
    // 1. Decode the image from the File/Blob using the worker-safe API.
    // This replaces new Image() and FileReader.
    const imageBitmap = await createImageBitmap(file);

    // 2. Create the worker-safe canvas.
    // This replaces document.createElement('canvas').
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error("Failed to get 2D rendering context.");
    }

    let width = imageBitmap.width;
    let height = imageBitmap.height;

    // 3. Calculate new dimensions (your existing aspect ratio logic)
    if (width > maxWidth) {
      height = Math.round(height * (maxWidth / width));
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;

    // 4. Draw the image onto the canvas
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // 5. Compress and get the result as a Blob using the worker-safe API.
    // This replaces canvas.toBlob().
    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    
    const blob = await canvas.convertToBlob({
      type: mimeType,
      quality: quality
    });
    
    const arrayBuffer = await blob.arrayBuffer();
    // 6. Send the compressed Blob back to the main thread.
    // We use the second argument for "transferable" objects for performance.
    self.postMessage({ 
      // Send the buffer and the metadata
      buffer: arrayBuffer, 
      fileType: mimeType,
      originalSize: file.size,
      compressedSize: blob.size
  }, [arrayBuffer]);

  } catch (error: any) {
    // Catch any decoding or processing errors
    console.error("Worker processing error:", error);
    self.postMessage({ error: error.message || 'Image compression failed.' });
  }
};