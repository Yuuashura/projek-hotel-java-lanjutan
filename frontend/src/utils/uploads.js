import api from './api';

export const validateImageFile = (file) => {
  if (!file) return 'File tidak boleh kosong';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Format gambar harus JPG, PNG, atau WEBP';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'Ukuran file maksimal 5MB';
  }
  return '';
};

export const uploadFile = async (url, file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  const response = await api.post(url, formData);
  return response.data?.data?.url || response.data?.url;
};

export const getImageUrl = (path, fallback = '') => {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_URL || '';
  const cleanApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return cleanApiBase + cleanPath;
};
