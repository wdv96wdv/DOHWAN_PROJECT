/**
 * 페이스(분/km)를 "분'초\"" 형식의 문자열로 변환합니다.
 * @param {number} pace - 분 단위 페이스 (예: 5.5 = 5분 30초)
 * @returns {string} 포맷팅된 페이스 문자열 (예: "5'30\"")
 */
export const formatPace = (pace) => {
    if (!pace) return "0'00\"";
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}'${secs.toString().padStart(2, '0')}"`;
};
