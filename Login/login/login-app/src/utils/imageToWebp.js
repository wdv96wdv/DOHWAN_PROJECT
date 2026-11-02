// 이미지를 브라우저에서 WebP로 압축한다 (업로드 전에 용량을 줄이기 위함).
// - 긴 변을 maxEdge(px) 이하로 줄이고
// - 품질을 낮춰가며 targetBytes 이하가 될 때까지 시도한다.
// 애니메이션 GIF는 첫 프레임만 사용된다.

const DEFAULT_MAX_EDGE = 1200;
const DEFAULT_TARGET_BYTES = 400 * 1024;
const MIN_QUALITY = 0.5;

const loadBitmap = async (file) => {
  // EXIF 회전 정보를 반영해서 읽는다
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // 아래 Image 폴백 사용
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

const toBlob = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));

export const formatBytes = (n) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`;

/**
 * @returns {Promise<{file: File, width: number, height: number, originalSize: number, size: number}>}
 */
export async function compressToWebp(
  file,
  { maxEdge = DEFAULT_MAX_EDGE, targetBytes = DEFAULT_TARGET_BYTES } = {}
) {
  const bitmap = await loadBitmap(file);
  const srcW = bitmap.width || bitmap.naturalWidth;
  const srcH = bitmap.height || bitmap.naturalHeight;
  if (!srcW || !srcH) throw new Error('이미지 크기를 확인할 수 없습니다.');

  let scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  let blob = null;
  let width = srcW;
  let height = srcH;

  // 품질을 먼저 낮추고, 그래도 크면 해상도를 15%씩 줄인다 (최대 3번)
  for (let shrink = 0; shrink <= 3; shrink += 1) {
    width = Math.max(1, Math.round(srcW * scale));
    height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    let quality = 0.85;
    blob = await toBlob(canvas, quality);
    while (blob && blob.size > targetBytes && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.1);
      blob = await toBlob(canvas, quality);
    }

    if (!blob || blob.size <= targetBytes) break;
    scale *= 0.85;
  }

  if (typeof bitmap.close === 'function') bitmap.close();

  // WebP를 지원하지 않는 브라우저는 PNG 등을 돌려주므로 확인한다
  if (!blob || blob.type !== 'image/webp') {
    throw new Error('이 브라우저는 WebP 변환을 지원하지 않습니다. 최신 Chrome, Edge, Safari를 사용해 주세요.');
  }

  const baseName = (file.name || 'poster').replace(/\.[^.]+$/, '') || 'poster';
  return {
    file: new File([blob], `${baseName}.webp`, { type: 'image/webp' }),
    width,
    height,
    originalSize: file.size,
    size: blob.size,
  };
}
