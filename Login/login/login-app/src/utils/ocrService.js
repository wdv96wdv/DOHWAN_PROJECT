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
  
  // 텍스트 줄바꿈 유지하면서 줄별로 분리 및 시스템 영역(상단 3줄) 제외
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  const bodyLines = lines.length > 4 ? lines.slice(3) : lines; 
  const bodyText = bodyLines.join("\n");
  const cleanBodyText = bodyText.replace(/\s+/g, " ");

  let distance = null;
  let duration = null;
  let pace = null;
  let date = null;
  let calories = null;
  let cadence = null;

  // 1. 거리 (KM) 추출: bodyText에서 탐색
  // (\d+\.\d{2}) 패턴을 기본으로 하되, 주변에 KM/킬로미터가 있는지 우선 확인
  const distanceWithUnit = bodyText.match(/(\d+\.\d{2})\s*(?:km|KM|킬로미터|킬로미터)/);
  if (distanceWithUnit) {
    distance = distanceWithUnit[1];
  } else {
    const distanceMatch = bodyText.match(/(\d+\.\d{2})/);
    if (distanceMatch) distance = distanceMatch[1];
  }

  // 2. 시간 추출: '시간' 키워드 근처 또는 bodyText 하단부 탐색
  const durationMatches = bodyText.match(/(\d{1,2}:\d{2}:\d{2})|(\d{1,2}:\d{2})/g) || [];
  let durationStr = "";
  if (durationMatches.length > 0) {
    const timeIndex = bodyText.indexOf("시간");
    if (timeIndex !== -1) {
      const nearbyText = bodyText.substring(Math.max(0, timeIndex - 15), Math.min(bodyText.length, timeIndex + 15));
      const nearbyMatch = nearbyText.match(/(\d{1,2}:\d{2}:\d{2})|(\d{1,2}:\d{2})/);
      if (nearbyMatch) durationStr = nearbyMatch[0];
    }
    
    if (!durationStr) {
      // 마지막에 오는 시간 형식이 보통 러닝 타임임
      durationStr = durationMatches[durationMatches.length - 1];
    }
    duration = durationStr;
  }

  // 3. 페이스 추출: '페이스' 키워드 주변 우선 탐색
  const paceMatches = bodyText.match(/(\d{1,2}[':]\d{2}"?)/g) || [];
  if (paceMatches.length > 0) {
    const paceIndex = bodyText.indexOf("페이스");
    if (paceIndex !== -1) {
      const nearbyText = bodyText.substring(Math.max(0, paceIndex - 15), Math.min(bodyText.length, paceIndex + 15));
      const nearbyMatch = nearbyText.match(/(\d{1,2}[':]\d{2}"?)/);
      if (nearbyMatch) pace = nearbyMatch[0].replace('"', "");
    }
    
    if (!pace) {
      pace = paceMatches[0].replace('"', "");
    }
  }

  // 4. 칼로리 추출
  const calRegex = /(\d{2,4})[\s\n]{1,10}(?=칼로리|calories|Calories)/i;
  const calMatch = bodyText.match(calRegex) || 
                   bodyText.match(/(?:칼로리|calories|Calories)[\s\n]{1,10}(\d{2,4})/i) ||
                   (durationStr ? bodyText.match(new RegExp(`${durationStr}[\\s\\n]+(\\d{2,4})`)) : null);
  
  if (calMatch) {
    calories = calMatch[1];
  } else {
    // 폴백: 거리/시간/페이스로 인식되지 않은 숫자 중 50~2000 사이의 숫자를 칼로리로 추정
    const allNumbers = bodyText.match(/\b\d{2,4}\b/g) || [];
    const usedValues = [distance, cadence].filter(Boolean);
    const candidates = allNumbers
      .map(Number)
      .filter(n => n >= 50 && n <= 2000 && !usedValues.includes(String(n)));
    
    if (candidates.length > 0) {
      // 보통 칼로리는 뒤쪽에 배치됨
      calories = String(candidates[candidates.length - 1]);
    }
  }

  // 5. 케이던스 추출 (탐욕적 매칭 방지 및 범위 필터링 추가)
  // \b를 사용하여 숫자가 중간에 잘리지 않도록 하고, .*?로 비탐욕적 매칭 수행
  const cadRegex = /\b(\d{2,3})\b[\s\n\D]{1,15}?(?=케이던스|cadence|Cadence)/i;
  const cadMatch = bodyText.match(cadRegex) || 
                   bodyText.match(/(?:케이던스|cadence|Cadence)[\s\n\D]{1,15}?\b(\d{2,3})\b/i) ||
                   // 고도(m)나 심박수(0) 뒤에 기호(--) 등이 섞여 있어도 전체 숫자 추출
                   bodyText.match(/(?:m|0|심박수).*?\b(\d{2,3})\b/i);
  
  if (cadMatch) {
    cadence = cadMatch[1];
  } else {
    // 최종 폴백: 현실적인 케이던스 범위(130~210)에 있는 숫자를 우선 선택
    const allNumbers = bodyText.match(/\b\d{2,3}\b/g) || [];
    const candidates = allNumbers.map(Number).filter(n => n >= 130 && n <= 210);
    if (candidates.length > 0) {
      cadence = String(candidates[candidates.length - 1]);
    } else if (allNumbers.length > 0) {
      cadence = allNumbers[allNumbers.length - 1];
    }
  }

  // 7. NRC 사진 여부 심층 검증
  const lowerText = text.toLowerCase();
  
  // OCR 오인식 대응 키워드 포함
  const nrcKeywords = [
    "nike", "nrc", "페이스", "킬로미터", "시간", "칼로리", "케이던스", "km", "km/h",
    "rk", "rn", "nr", "nik", "pace", "duration", "calories", "cadence", "kcal"
  ];
  
  const foundKeywords = nrcKeywords.filter(key => lowerText.includes(key));
  const hasMultipleKeywords = foundKeywords.length >= 2;
  
  // 필수 데이터 존재 여부
  const hasCoreData = !!distance && (!!duration || !!pace);
  const hasSomeData = !!distance || (!!duration && !!pace);

  /**
   * 인식 결과 분류: 
   * - high: 확실한 NRC 형식 (데이터 + 다수 키워드)
   * - normal: 유효한 데이터가 충분히 발견됨 (자른 사진 등)
   * - low: 데이터가 부족하거나 형식이 불분명함
   */
  let matchQuality = "low";
  if (hasCoreData && hasMultipleKeywords) {
    matchQuality = "high";
  } else if (hasCoreData || (hasSomeData && foundKeywords.length >= 1)) {
    matchQuality = "normal";
  } else if (hasSomeData) {
    matchQuality = "low"; // 데이터는 있으나 확신 부족
  }

  return {
    distance_km: distance,
    duration: duration,
    pace: pace,
    calories: calories,
    cadence: cadence,
    record_date: date,
    isNRC: matchQuality !== "low", // 기존 호환성 유지
    matchQuality: matchQuality,    // 정밀 검증용 추가
    foundKeywords: foundKeywords,
    rawText: text
  };
};
