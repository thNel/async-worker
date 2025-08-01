import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export function useSortableData<T>(data: T[]) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [direction, setDirection] = useState<SortDirection>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? -1 : 1;
      if (bVal == null) return direction === 'asc' ? 1 : -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, direction]);

  function requestSort(key: keyof T) {
    if (sortKey === key) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  }

  return { sorted, sortKey, direction, requestSort };
}
