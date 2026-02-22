import { useState, useCallback } from 'react';

export const useSortFilter = (defaultSort = 'name', defaultOrder = 'ASC') => {
  const [sortBy, setSortBy]       = useState(defaultSort);
  const [sortOrder, setSortOrder] = useState(defaultOrder);

  const handleSort = useCallback((field) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
        return prev;
      }
      setSortOrder('ASC');
      return field;
    });
  }, []);

  return { sortBy, sortOrder, handleSort };
};
