/**
 * Downscale an image file in the browser.
 * Preview mode stores the result as a data URL; with a backend, upload the Blob
 * to cloud storage instead and keep only the returned URL.
 */
export async function resizeImage(file, { max = 1200, quality = 0.82 } = {}) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bmp, 0, 0, width, height);
  const url = canvas.toDataURL('image/webp', quality).startsWith('data:image/webp')
    ? canvas.toDataURL('image/webp', quality)
    : canvas.toDataURL('image/jpeg', quality);
  return { url, width, height, fileName: file.name, fileType: file.type, fileSize: file.size, uploadDate: new Date().toISOString() };
}
