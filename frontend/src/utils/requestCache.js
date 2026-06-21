import api from './api';

const cache = new Map();
const pending = new Map();

const getKey = (url, params) => `${url}:${JSON.stringify(params || {})}`;

export const cachedGet = async (url, { params, ttl = 5 * 60 * 1000 } = {}) => {
  const key = getKey(url, params);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (pending.has(key)) {
    return pending.get(key);
  }

  const request = api.get(url, { params })
    .then((response) => {
      cache.set(key, { value: response, expiresAt: Date.now() + ttl });
      return response;
    })
    .finally(() => pending.delete(key));

  pending.set(key, request);
  return request;
};

export const invalidateCachedGet = (url) => {
  for (const key of cache.keys()) {
    if (key.startsWith(`${url}:`)) cache.delete(key);
  }
};
