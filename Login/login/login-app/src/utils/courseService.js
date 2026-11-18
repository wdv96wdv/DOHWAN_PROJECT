// src/utils/courseService.js
import supabase from './supabaseClient';
import { COURSE_LIST } from './courseData';
import { toWebp } from './imageUtils';

const STORAGE_KEY = 'dorunning_custom_courses';

/**
 * Get all courses (from Supabase if table exists, otherwise from localStorage/defaults)
 */
export async function getCourses() {
  try {
    // 1. Try Supabase first
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data && data.length > 0) {
      // Normalize any Supabase fields if necessary
      return data;
    }
  } catch (err) {
    console.warn('Supabase courses fetch fallback:', err?.message);
  }

  // 2. Fallback to localStorage / default list
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('localStorage read error:', e);
  }

  // 3. First time initialization
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(COURSE_LIST));
  } catch (e) {
    console.warn('localStorage set error:', e);
  }

  return COURSE_LIST;
}

/**
 * Save (insert or update) a course
 */
export async function saveCourse(courseData) {
  const isNew = !courseData.id;
  const courseId = isNew ? `custom_${Date.now()}` : String(courseData.id);

  const normalized = {
    ...courseData,
    id: courseId,
    distanceKm: parseFloat(courseData.distanceKm) || 5.0,
    distance: courseData.distance || `${courseData.distanceKm || 5.0}km`,
    amenities: courseData.amenities || {
      toilet: true,
      water: false,
      locker: false,
      parking: true,
      nightLight: true
    },
    tags: Array.isArray(courseData.tags) ? courseData.tags : (courseData.tags || '').split(',').map(s => s.trim()).filter(Boolean),
    center: courseData.center || [37.545, 126.975],
    coords: courseData.coords || [
      [37.545, 126.975],
      [37.547, 126.978],
      [37.549, 126.982],
      [37.551, 126.985]
    ],
    updated_at: new Date().toISOString()
  };

  // 1. Save to localStorage
  try {
    const current = await getCourses();
    const existingIndex = current.findIndex(c => String(c.id) === String(courseId));
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...current];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...normalized };
    } else {
      updatedList = [normalized, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('localStorage save error:', e);
  }

  // 2. Try saving to Supabase
  try {
    await supabase.from('courses').upsert(normalized, { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase save error (will rely on localStorage):', err?.message);
  }

  return normalized;
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId) {
  // 1. Remove from localStorage
  try {
    const current = await getCourses();
    const filtered = current.filter(c => String(c.id) !== String(courseId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('localStorage delete error:', e);
  }

  // 2. Try removing from Supabase
  try {
    await supabase.from('courses').delete().eq('id', String(courseId));
  } catch (err) {
    console.warn('Supabase delete error:', err?.message);
  }

  return true;
}

/**
 * Upload course image (to Supabase Storage 'posters' or base64 fallback)
 */
export async function uploadCourseImage(file) {
  try {
    const webpBlob = await toWebp(file, 1200, 0.85);
    const fileName = `courses/course_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;

    // Try Supabase Storage upload
    const { error: uploadError } = await supabase.storage
      .from('posters')
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        upsert: true
      });

    if (!uploadError) {
      const { data: publicData } = supabase.storage
        .from('posters')
        .getPublicUrl(fileName);
      if (publicData?.publicUrl) {
        return publicData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase image upload failed, falling back to DataURL:', err);
  }

  // Fallback to local Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
