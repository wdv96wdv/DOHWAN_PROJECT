// 최신 jimp v1 API 사용 - getBuffer로 JPEG quality 지정
const { Jimp, JimpMime } = require('jimp');
const path = require('path');
const fs = require('fs');

const TARGET_DIR = path.join(__dirname, 'src/assets/img');

// 압축 대상: JPEG 파일 (PNG는 무손실 특성상 jimp로 축소가 어려움)
const targets = [
  { file: 'hangangnight.jpg',    maxWidth: 1920, quality: 70 },
  { file: 'challenge.jpg',       maxWidth: 1920, quality: 75 },
  { file: 'recommend.jpg',       maxWidth: 1000, quality: 75 },
  { file: 'banner1.jpg',         maxWidth: 1200, quality: 80 },
  { file: 'banner2.jpg',         maxWidth: 1200, quality: 80 },
  { file: 'banner3.jpg',         maxWidth: 1200, quality: 80 },
  { file: 'beginner.jpg',        maxWidth: 800,  quality: 80 },
  { file: 'half.jpg',            maxWidth: 800,  quality: 80 },
  { file: 'ten.jpg',             maxWidth: 800,  quality: 80 },
];

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB (' + (bytes / 1024).toFixed(0) + ' KB)';
}

async function compress() {
  console.log('이미지 압축 시작 (jimp v1 API)...\n');

  for (const { file, maxWidth, quality } of targets) {
    const filePath = path.join(TARGET_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log('건너뜀 (파일 없음): ' + file);
      continue;
    }

    const beforeSize = fs.statSync(filePath).size;

    try {
      const image = await Jimp.read(filePath);

      if (image.bitmap.width > maxWidth) {
        image.resize({ w: maxWidth });
      }

      // jimp v1: getBuffer로 quality 지정 후 파일 저장
      const buffer = await image.getBuffer(JimpMime.jpeg, { quality });
      fs.writeFileSync(filePath, buffer);

      const afterSize = fs.statSync(filePath).size;
      const ratio = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);
      const sign = ratio > 0 ? '-' : '+';
      console.log('[완료] ' + file);
      console.log('   전: ' + formatSize(beforeSize));
      console.log('   후: ' + formatSize(afterSize) + '  (' + Math.abs(ratio) + '% ' + (ratio > 0 ? '감소' : '증가') + ')\n');
    } catch (err) {
      console.error('[실패] ' + file + ': ' + err.message);
    }
  }

  console.log('압축 완료!');
}

compress();
