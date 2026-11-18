/**
 * GPX (GPS Exchange Format) XML generator & file downloader for runners.
 * Compatible with Garmin Connect, Apple Watch Workout, Strava, NRC, Suunto, Coros.
 */

export function generateGpx(course) {
  const time = new Date().toISOString();
  const trackPoints = (course.coords || [])
    .map(([lat, lon], idx) => {
      // Small simulated elevation if not provided
      const ele = course.elevationMeters ? course.elevationMeters[idx] || 25 : 20;
      return `      <trkpt lat="${lat}" lon="${lon}">
        <ele>${ele}</ele>
        <time>${time}</time>
      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="DoRunning - https://www.dorunning.app"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(course.title)}</name>
    <desc>${escapeXml(course.description || '')} - 두러닝(DoRunning) 추천 코스</desc>
    <author>
      <name>DoRunning</name>
      <link href="https://www.dorunning.app/course" />
    </author>
    <time>${time}</time>
  </metadata>
  <trk>
    <name>${escapeXml(course.title)}</name>
    <type>running</type>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`;
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadCourseGpx(course) {
  try {
    const xml = generateGpx(course);
    const blob = new Blob([xml], { type: 'application/gpx+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = (course.title || 'course').replace(/[/\\?%*:|"<>]/g, '_');
    a.href = url;
    a.download = `DoRunning_${safeTitle}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('GPX download failed:', err);
    return false;
  }
}
