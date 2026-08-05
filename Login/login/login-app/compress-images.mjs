const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const TARGET_DIR = path.join(__dirname, 'src/assets/img');

// 압축 대상 이미지 및 설정
const targets = [
  { file: 'aboutrunning.jpg',    maxWidth: 1920, quality: 70 },
  { file: 'hangangnight.jpg',    maxWidth: 1920, quality: 75 },
  { file: '10kmrecommendimg.png', maxWidth: 1920, quality: 80 },
  { file: 'challenge.jpg',       maxWidth: 1920, quality: 75 },
  { file: 'recommend.jpg',       maxWidth: 1920, quality: 75 },
  { file: 'marathon-poster.png', maxWidth: 1200, quality: 80 },
  { file: 'community.png',       maxWidth: 1200, quality: 80 },
  { file: 'dorunninglogo.png',   maxWidth: 512,  quality: 90 },
  { file: 'loading-shoe.png',    maxWidth: 512,  quality: 85 },
];

function formatSize(bytes) {
  const mb = bytes / 1024 / 1024;
  return mb.toFixed(2) + ' MB';
}

async function compress() {
  console.log('🖼️  이미지 압축 시작...\n');

  for (const { file, maxWidth, quality } of targets) {
    const filePath = path.join(TARGET_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log('⚠️  건너뜀 (파일 없음): ' + file);
      continue;
    }

    const beforeSize = fs.statSync(filePath).size;

    try {
      const image = await Jimp.read(filePath);

      if (image.bitmap.width > maxWidth) {
        image.resize({ w: maxWidth });
      }

      if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        await image.quality(quality).write(filePath);
      } else {
        await image.write(filePath);
      }

      const afterSize = fs.statSync(filePath).size;
      const ratio = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);
      console.log('✅ ' + file);
      console.log('   전: ' + formatSize(beforeSize) + '  →  후: ' + formatSize(afterSize) + '  (' + ratio + '% 절감)');
    } catch (err) {
      console.error('❌ 실패: ' + file, err.message);
    }
  }

  console.log('\n🎉 압축 완료!');
}

compress();
