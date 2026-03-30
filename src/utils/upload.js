const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || '';
const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'hotel_uploads';
const URL = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;

/**
 * Upload file to Cloudinary (unsigned)
 * @param {File} file
 * @returns {Promise<string>} URL of uploaded image
 */
export async function uploadImage(file) {
  if (!CLOUD) throw new Error('VITE_CLOUDINARY_CLOUD chưa được cấu hình');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET);
  form.append('folder', 'hotel-booking');

  const res = await fetch(URL, { method: 'POST', body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Upload ảnh thất bại');
  }

  const data = await res.json();
  return data.secure_url;
}
