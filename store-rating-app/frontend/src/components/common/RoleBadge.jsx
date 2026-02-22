import React from 'react';

const LABELS = { admin: 'Admin', user: 'User', store_owner: 'Store Owner' };

export default function RoleBadge({ role }) {
  return <span className={`badge badge-${role}`}>{LABELS[role] ?? role}</span>;
}
