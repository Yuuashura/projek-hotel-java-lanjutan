export const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
};

export const getErrorMessage = (error, fallback = 'Terjadi kesalahan') => {
  const payload = error?.response?.data;
  if (typeof payload === 'string') return payload;
  return payload?.message || payload?.error || fallback;
};
