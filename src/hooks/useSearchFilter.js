import { useState, useMemo } from 'react';

export function useSearchFilter(items, searchFields = ['name', 'description']) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    return items.filter(item =>
      searchFields.some(field =>
        item[field]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [items, searchQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filteredItems
  };
} 