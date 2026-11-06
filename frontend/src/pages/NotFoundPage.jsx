import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-3xl flex items-center justify-center mb-4">
        <ShoppingBag size={32} />
      </div>
      <h1 className="text-4xl font-black text-navy-950 mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Back to Marketplace Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
