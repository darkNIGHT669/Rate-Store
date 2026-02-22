import React, { useState } from 'react';

export function Stars({ value = 0, max = 5, size = '' }) {
  return (
    <span className={`stars ${size}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star${i < Math.round(value) ? ' on' : ''}`}>★</span>
      ))}
    </span>
  );
}

export function StarPicker({ value = 0, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <span className="stars stars-lg">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star interactive${n <= active ? ' on' : ''}`}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange(n)}
          role="button"
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}
