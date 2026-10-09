/** Downscale an image in the browser. */
async function draw(file, max) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bmp, 0, 0, width, height);
  return { canvas, width, height };
}

/** Preview mode: data URL kept in the browser */
export async function resizeImage(file, { max = 1200, quality = 0.82 } = {}) {
  const { canvas, width, height } = await draw(file, max);
  let url = canvas.toDataURL('image/webp', quality);
  if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', quality);
  return { url, width, height, fileName: file.name, fileType: file.type, fileSize: file.size, uploadDate: new Date().toISOString() };
}

/** Live mode: Blob for upload to storage */
export async function resizeToBlob(file, { max = 1400, quality = 0.84 } = {}) {
  const { canvas, width, height } = await draw(file, max);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    || await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  return { blob, width, height, type: blob.type };
}
