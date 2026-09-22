/**
 * Shared marathon date/status helpers (KST calendar-day compares).
 * Prefer YYYY-MM-DD string compares to avoid UTC parsing quirks of `new Date('YYYY-MM-DD')`.
 */

/** Normalize API date (array [y,m,d] or string) to YYYY-MM-DD, or null. */
export function formatRawDate(date) {
  if (date == null || date === '') return null;
  if (Array.isArray(date)) {
    const [y, m, d] = date;
    if (y == null || m == null || d == null) return null;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (!trimmed) return null;
    // Already YYYY-MM-DD or ISO — take date part
    return trimmed.slice(0, 10);
  }
  return null;
}

/** Today's calendar date in Asia/Seoul as YYYY-MM-DD. */
export function getTodayKstStr(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Map API marathon payload to listing/home shape. */
export function normalizeMarathon(m) {
  return {
    id: m.id,
    title: m.title,
    link: m.link,
    location: m.location,
    raceDate: formatRawDate(m.race_date ?? m.raceDate),
    startDate: formatRawDate(m.start_date ?? m.startDate),
    endDate: formatRawDate(m.end_date ?? m.endDate),
    type: Array.isArray(m.type) ? m.type : ['마라톤'],
    firstComeFirstServed: Boolean(m.is_first_come ?? m.firstComeFirstServed),
  };
}

export function isPastRace(marathon, todayStr = getTodayKstStr()) {
  if (!marathon?.raceDate) return false;
  return marathon.raceDate < todayStr;
}

/** Open registration window (inclusive), race not yet past. */
export function isOpenRegistration(marathon, todayStr = getTodayKstStr()) {
  if (!marathon?.startDate || !marathon?.endDate) return false;
  // Exclude past and race-day events from open-registration carousels
  if (marathon.raceDate && marathon.raceDate <= todayStr) return false;
  return todayStr >= marathon.startDate && todayStr <= marathon.endDate;
}

/**
 * Status labels used by listing filters/badges.
 * @returns {"접수 예정"|"접수중"|"선착순 접수중"|"마감 임박"|"접수마감"|"종료"|"상태불명"}
 */
export function getMarathonStatus(marathon, todayStr = getTodayKstStr()) {
  const { startDate, endDate, raceDate, firstComeFirstServed } = marathon || {};

  // Past or race day → 종료
  if (raceDate && raceDate <= todayStr) return '종료';

  if (startDate && todayStr < startDate) return '접수 예정';

  if (startDate && endDate && todayStr >= startDate && todayStr <= endDate) {
    const daysLeft = daysBetween(todayStr, endDate);
    if (daysLeft <= 7) return '마감 임박';
    return firstComeFirstServed ? '선착순 접수중' : '접수중';
  }

  if (endDate && todayStr > endDate && (!raceDate || todayStr < raceDate)) {
    return '접수마감';
  }

  return '상태불명';
}

/** Inclusive day difference: endStr - startStr in calendar days (KST strings). */
function daysBetween(startStr, endStr) {
  const a = parseKstDateOnly(startStr);
  const b = parseKstDateOnly(endStr);
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.round((b - a) / 86400000);
}

function parseKstDateOnly(yyyyMmDd) {
  if (!yyyyMmDd || typeof yyyyMmDd !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!m) return null;
  // Noon UTC avoids DST edge issues; we only need day deltas for YYYY-MM-DD.
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
}

/** Default listing sort: non-종료 first, then raceDate ascending; 종료 last (by raceDate). */
export function compareUpcomingFirst(a, b) {
  const aEnded = a.status === '종료' || isPastRace(a);
  const bEnded = b.status === '종료' || isPastRace(b);
  if (aEnded !== bEnded) return aEnded ? 1 : -1;
  const aDate = a.raceDate || '';
  const bDate = b.raceDate || '';
  return aDate.localeCompare(bDate);
}

/** Open-reg carousel: nearest registration deadline first. */
export function compareByEndDateAsc(a, b) {
  if (!a.endDate && !b.endDate) return 0;
  if (!a.endDate) return 1;
  if (!b.endDate) return -1;
  return a.endDate.localeCompare(b.endDate);
}

export const STATUS_CLASS_MAP = {
  '접수 예정': 'm-wait',
  '접수중': 'm-open',
  '선착순 접수중': 'm-firstcome',
  '마감 임박': 'm-firstcome',
  '접수마감': 'm-closed',
  '종료': 'm-finished',
};

export const STATUS_FILTER_GROUPS = {
  '전체': [],
  '접수중': ['접수중', '선착순 접수중'],
  '접수 예정': ['접수 예정'],
  '마감 임박': ['마감 임박'],
  '접수마감': ['접수마감'],
  '종료': ['종료'],
};
