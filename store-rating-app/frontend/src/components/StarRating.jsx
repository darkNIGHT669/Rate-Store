import React, { useState } from 'react';

export function StarDisplay({ value, max = 5 }) {
  return (
    <span className="stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`star ${i < Math.round(value) ? 'filled' : 'empty'}`}>★</span>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);

  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'filled' : 'empty'}`}
          style={{ cursor: disabled ? 'default' : 'pointer', fontSize: '1.5rem' }}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange(star)}
        >
          ★
        </span>
      ))}
    </span>
  );
}
