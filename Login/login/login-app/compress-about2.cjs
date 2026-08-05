// aboutrunning.jpg 전용 압축 - jpeg-js 직접 사용으로 메모리 제한 우회
const jpegJs = require('jpeg-js');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'src/assets/img/aboutrunning.jpg');

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB (' + (bytes / 1024).toFixed(0) + ' KB)';
}

async function compress() {
  console.log('aboutrunning.jpg 직접 JPEG 압축 시작...\n');

  if (!fs.existsSync(filePath)) {
    console.log('파일 없음: aboutrunning.jpg');
    return;
  }

  const beforeSize = fs.statSync(filePath).size;
  console.log('전 크기:', formatSize(beforeSize));

  const fileBuffer = fs.readFileSync(filePath);

  console.log('디코딩 중 (maxMemoryUsageInMB=2048)...');
  const rawImageData = jpegJs.decode(fileBuffer, {
    useTArray: true,
    maxMemoryUsageInMB: 2048
  });

  console.log('원본 해상도:', rawImageData.width, 'x', rawImageData.height);

  // 해상도를 1920 너비로 축소
  const maxWidth = 1920;
  let targetW = rawImageData.width;
  let targetH = rawImageData.height;

  if (targetW > maxWidth) {
    const ratio = maxWidth / targetW;
    targetW = maxWidth;
    targetH = Math.round(targetH * ratio);
  }

  console.log('축소 목표:', targetW, 'x', targetH);

  // 간단한 bilinear 축소
  const srcData = rawImageData.data;
  const srcW = rawImageData.width;
  const srcH = rawImageData.height;
  const dstData = new Uint8Array(targetW * targetH * 4);

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.min(Math.floor(x * srcW / targetW), srcW - 1);
      const srcY = Math.min(Math.floor(y * srcH / targetH), srcH - 1);
      const srcIdx = (srcY * srcW + srcX) * 4;
      const dstIdx = (y * targetW + x) * 4;
      dstData[dstIdx]     = srcData[srcIdx];
      dstData[dstIdx + 1] = srcData[srcIdx + 1];
      dstData[dstIdx + 2] = srcData[srcIdx + 2];
      dstData[dstIdx + 3] = srcData[srcIdx + 3];
    }
  }

  console.log('인코딩 중 (quality=65)...');
  const encoded = jpegJs.encode({ data: dstData, width: targetW, height: targetH }, 65);
  fs.writeFileSync(filePath, encoded.data);

  const afterSize = fs.statSync(filePath).size;
  const ratio = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);

  console.log('\n[완료] aboutrunning.jpg');
  console.log('   전:', formatSize(beforeSize));
  console.log('   후:', formatSize(afterSize), ' (' + ratio + '% 감소)');
}

compress().catch(console.error);
