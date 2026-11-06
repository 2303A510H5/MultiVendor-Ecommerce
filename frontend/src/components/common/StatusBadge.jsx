import React from 'react';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, VENDOR_STATUS_CONFIG } from '../../utils/formatters';

const StatusBadge = ({ status, type = 'order', size = 'sm' }) => {
  let config;

  if (type === 'payment') {
    config = PAYMENT_STATUS_CONFIG[status] || {
      label: status,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    };
  } else if (type === 'vendor') {
    config = VENDOR_STATUS_CONFIG[status] || {
      label: status,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    };
  } else {
    config = ORDER_STATUS_CONFIG[status] || {
      label: status,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    };
  }

  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
