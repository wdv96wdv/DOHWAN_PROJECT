// 최신 jimp v1 API - aboutrunning.jpg 전용 고메모리 압축
const { Jimp, JimpMime } = require('jimp');
const path = require('path');
const fs = require('fs');

const TARGET_DIR = path.join(__dirname, 'src/assets/img');

// aboutrunning.jpg 전용 (메모리 4GB로 실행해야 함)
const targets = [
  { file: 'aboutrunning.jpg', maxWidth: 1920, quality: 65 },
];

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB (' + (bytes / 1024).toFixed(0) + ' KB)';
}

async function compress() {
  console.log('aboutrunning.jpg 압축 시작...\n');

  for (const { file, maxWidth, quality } of targets) {
    const filePath = path.join(TARGET_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log('건너뜀 (파일 없음): ' + file);
      continue;
    }

    const beforeSize = fs.statSync(filePath).size;
    console.log('처리 중: ' + file + ' (' + formatSize(beforeSize) + ')');
    console.log('메모리 한도가 커서 시간이 걸릴 수 있습니다...');

    try {
      const image = await Jimp.read(filePath);
      console.log('이미지 읽기 완료. 크기 조절 중...');

      if (image.bitmap.width > maxWidth) {
        image.resize({ w: maxWidth });
      }

      console.log('JPEG 압축 중 (quality=' + quality + ')...');
      const buffer = await image.getBuffer(JimpMime.jpeg, { quality });
      fs.writeFileSync(filePath, buffer);

      const afterSize = fs.statSync(filePath).size;
      const ratio = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);
      console.log('\n[완료] ' + file);
      console.log('   전: ' + formatSize(beforeSize));
      console.log('   후: ' + formatSize(afterSize) + '  (' + ratio + '% 감소)');
    } catch (err) {
      console.error('[실패] ' + file + ': ' + err.message);
    }
  }

  console.log('\n압축 완료!');
}

compress();
