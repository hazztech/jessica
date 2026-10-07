/**
 * Tiny localStorage "table" used while the site runs without a backend.
 * Every service built on this keeps the same async API a real database
 * service will have, so swapping storage later doesn't touch the UI.
 */
export class StorageFullError extends Error {
  constructor() {
    super('Browser storage is full. Remove some images or data, or connect the backend.');
    this.name = 'StorageFullError';
  }
}

export function collection(key, seed = () => []) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) {
        const initial = seed();
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return seed();
    }
  };
  const write = (list) => {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      throw new StorageFullError();
    }
    window.dispatchEvent(new CustomEvent('jcsa:data', { detail: key }));
  };
  return {
    all: read,
    get: (id, field = 'id') => read().find((r) => r[field] === id) || null,
    upsert(record, field = 'id') {
      const list = read();
      const i = list.findIndex((r) => r[field] === record[field]);
      if (i >= 0) list[i] = record;
      else list.unshift(record);
      write(list);
      return record;
    },
    remove(id, field = 'id') {
      write(read().filter((r) => r[field] !== id));
    },
    replaceAll: write,
  };
}

export const uid = (prefix = '') =>
  `${prefix}${(crypto.randomUUID && crypto.randomUUID().slice(0, 8)) || Math.random().toString(16).slice(2, 10)}`;
