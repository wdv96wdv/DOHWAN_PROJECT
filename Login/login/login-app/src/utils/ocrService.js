import { createWorker } from "tesseract.js";

/**
 * NRC 스크린샷 텍스트에서 러닝 데이터를 추출하는 유틸리티
 */
export const processNRCImage = async (imageFile) => {
  const worker = await createWorker("eng+kor"); // 한글 레이블 인식을 위해 kor 추가
  
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    return parseNRCText(text);
  } catch (error) {
    console.error("OCR 분석 실패:", error);
    throw new Error("이미지 분석 중 오류가 발생했습니다.");
  } finally {
    await worker.terminate();
  }
};

/**
 * 텍스트 패턴 매칭을 통한 데이터 파싱
 */
const parseNRCText = (text) => {
  console.log("OCR 원본 텍스트:\n", text);
  
  const cleanText = text.replace(/\s+/g, " ");
  
  let distance = null;
  let duration = null;
  let pace = null;
  let date = null;
  let calories = null;
  let cadence = null;

  // 1. 거리 (KM) 추출: XX.XX 형식
  const distanceMatch = text.match(/(\d+\.\d{2})/);
  if (distanceMatch) {
    distance = distanceMatch[1];
  }

  // 2. 시간 추출: HH:MM:SS 또는 MM:SS
  const durationMatch = text.match(/(\d{1,2}:\d{2}:\d{2})|(\d{1,2}:\d{2})/g);
  let durationStr = "";
  if (durationMatch) {
    const timeCandidates = durationMatch.filter(t => t.includes(":"));
    if (timeCandidates.length > 0) {
      durationStr = timeCandidates.sort((a, b) => b.length - a.length)[0];
      duration = durationStr;
    }
  }

  // 3. 페이스 추출: 1'12" 또는 1:12 형식
  const paceMatch = text.match(/(\d{1,2}[':]\d{2}"?)/);
  if (paceMatch) {
    pace = paceMatch[1].replace('"', "");
  }

  // 4. 칼로리 추출 (강화된 로직)
  // 패턴 A: '숫자 + 칼로리/calories' (멀리 떨어져 있어도 가능하게 [\s\n]* 사용)
  const calRegexA = /(\d{2,4})[\s\n]*(?=칼로리|calories|Calories)/i;
  // 패턴 B: 시간(duration) 바로 뒤에 오는 2~4자리 숫자 (나이키 앱 특성)
  const calRegexB = new RegExp(`${durationStr}\\s*(\\d{2,4})`);
  
  const calMatch = text.match(calRegexA) || text.match(calRegexB) || text.match(/(?:칼로리|calories|Calories)[\s\n]*(\d{2,4})/i);
  if (calMatch) {
    calories = calMatch[1];
  }

  // 5. 케이던스 추출 (강화된 로직)
  // 패턴 A: '숫자 + 케이던스/cadence'
  const cadRegexA = /(\d{2,3})[\s\n]*(?=케이던스|cadence|Cadence)/i;
  // 패턴 B: 텍스트의 거의 마지막 부분에 위치한 2~3자리 숫자 (나이키 앱 특성)
  const cadRegexB = /(\d{2,3})\s*$/;
  // 패턴 C: 고도(m)나 심박수(0) 뒤에 오는 숫자
  const cadRegexC = /(?:m|0|심박수)[\s\n]*(\d{2,3})/i;

  const cadMatch = text.match(cadRegexA) || text.match(cadRegexC) || text.match(cadRegexB) || text.match(/(?:케이던스|cadence|Cadence)[\s\n]*(\d{2,3})/i);
  if (cadMatch) {
    cadence = cadMatch[1];
  }

  // 6. 날짜 추출
  const dateMatch = text.match(/(\d{4}[.\-/]\d{2}[.\-/]\d{2})/);
  if (dateMatch) {
    date = dateMatch[1].replace(/\./g, "-");
  }

  return {
    distance_km: distance,
    duration: duration,
    pace: pace,
    calories: calories,
    cadence: cadence,
    record_date: date,
    rawText: text
  };
};
