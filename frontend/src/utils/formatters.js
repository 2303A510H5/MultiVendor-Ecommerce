// Currency formatter (INR)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Date formatter
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

// Order status configuration
export const ORDER_STATUS_CONFIG = {
  Pending: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Confirmed: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Processing: { label: 'Processing', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Shipped: { label: 'Shipped', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Return Requested': { label: 'Return Requested', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Returned: { label: 'Returned', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Refund Processing': { label: 'Refund Processing', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  Refunded: { label: 'Refunded', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
};

// Payment status configuration
export const PAYMENT_STATUS_CONFIG = {
  Pending: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Successful: { label: 'Successful', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Failed: { label: 'Failed', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  Refunded: { label: 'Refunded', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Partially Refunded': { label: 'Partially Refunded', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
};

// Vendor status configuration
export const VENDOR_STATUS_CONFIG = {
  pending: { label: 'Pending Approval', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' },
  approved: { label: 'Approved & Active', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
  suspended: { label: 'Suspended', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
};
