import { useCallback, useEffect, useState } from 'react';
import { REQUESTS_CHANGED } from '../services/customRequests.js';

/** Load async data and reload whenever any admin data changes. */
export function useLiveData(loader, deps = []) {
  const [data, setData] = useState(null);
  const load = useCallback(() => { loader().then(setData); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
    window.addEventListener('jcsa:data', load);
    window.addEventListener(REQUESTS_CHANGED, load);
    return () => {
      window.removeEventListener('jcsa:data', load);
      window.removeEventListener(REQUESTS_CHANGED, load);
    };
  }, [load]);
  return [data, load];
}

export const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);
export const shortDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const stamp = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
