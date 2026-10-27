/**
 * 캘린더 연동 및 iCalendar (.ics) 파일 생성 유틸리티
 * 구글 캘린더, 애플 캘린더(iOS/macOS), 네이버 캘린더, 아웃룩 호환
 */

/**
 * 날짜 문자열(YYYY-MM-DD)을 YYYYMMDD 포맷으로 변환
 */
const formatIcsDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.replace(/[^0-9]/g, '').slice(0, 8);
};

/**
 * 다음 날 날짜를 YYYYMMDD 포맷으로 반환 (iCalendar 전일 이벤트용 DTEND)
 */
const formatIcsNextDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

/**
 * 구글 캘린더 등록 URL 생성
 */
export const getGoogleCalendarUrl = (marathon, pageUrl = window.location.href) => {
    if (!marathon?.race_date) return '#';
    const dStr = formatIcsDate(marathon.race_date);
    const nextStr = formatIcsNextDate(marathon.race_date);
    const title = encodeURIComponent(`[마라톤] ${marathon.title}`);
    const location = encodeURIComponent(marathon.location || '대한민국');
    const details = encodeURIComponent(
        `두러닝 마라톤 일정 상세:\n${pageUrl}\n공식 참가 링크: ${marathon.link || ''}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dStr}/${nextStr}&details=${details}&location=${location}`;
};

/**
 * 애플 캘린더 / 스마트폰 캘린더 호환 .ics 파일 생성 및 다운로드
 */
export const downloadIcsCalendar = (marathon, pageUrl = window.location.href) => {
    if (!marathon?.race_date) {
        alert('대회 개최 일정이 지정되지 않아 캘린더를 다운로드할 수 없습니다.');
        return false;
    }

    const startStr = formatIcsDate(marathon.race_date);
    const endStr = formatIcsNextDate(marathon.race_date);
    const nowTimestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `marathon-${marathon.id || Date.now()}@dorunning.app`;
    
    // 특수문자 이스케이프 (RFC 5545)
    const escapeIcs = (str) => {
        if (!str) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n');
    };

    const title = escapeIcs(`[마라톤] ${marathon.title}`);
    const location = escapeIcs(marathon.location || '대한민국');
    const description = escapeIcs(
        `[두러닝 마라톤 안내]\n대회명: ${marathon.title}\n일시: ${marathon.race_date}\n장소: ${marathon.location || '상세 공지 참조'}\n\n상세 정보 페이지:\n${pageUrl}\n공식 링크:\n${marathon.link || '없음'}`
    );

    // ICS 파일 구조 (RFC 5545 표준 + D-1 알림 포함)
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//DoRunning//Marathon Calendar//KO',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:두러닝 마라톤 일정',
        'X-WR-TIMEZONE:Asia/Seoul',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowTimestamp}`,
        `DTSTART;VALUE=DATE:${startStr}`,
        `DTEND;VALUE=DATE:${endStr}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `URL:${pageUrl}`,
        'STATUS:CONFIRMED',
        // 알림 1: 대회 1일 전 오전 9시 리마인더
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:내일은 [${escapeIcs(marathon.title)}] 마라톤 대회 날입니다! 준비물을 점검하세요.`,
        'END:VALARM',
        // 알림 2: 대회 당일 아침 알림
        'BEGIN:VALARM',
        'TRIGGER:-PT2H',
        'ACTION:DISPLAY',
        `DESCRIPTION:오늘 [${escapeIcs(marathon.title)}] 대회가 열립니다. 부상 없이 안전 완주를 응원합니다!`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    try {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        const cleanTitle = (marathon.title || 'marathon').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
        const fileName = `${cleanTitle}_두러닝일정.ics`;

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        return true;
    } catch (e) {
        console.error('ICS export failed:', e);
        return false;
    }
};
