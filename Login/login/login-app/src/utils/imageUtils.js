/**
 * 이미지 파일을 WebP로 변환합니다.
 * @param {File|Blob} file - 원본 이미지 파일
 * @param {number} maxSize - 최대 너비/높이 (px). 기본 1200
 * @param {number} quality - WebP 품질 (0~1). 기본 0.85
 * @returns {Promise<Blob>} WebP Blob
 */
export const toWebp = async (file, maxSize = 1200, quality = 0.85) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
  if (!blob || blob.type !== 'image/webp') throw new Error('WebP 변환에 실패했습니다.');
  return blob;
};

