import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no records to display matching your criteria.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm max-w-lg mx-auto my-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
