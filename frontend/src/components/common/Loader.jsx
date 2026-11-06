import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-brand-orange animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-2" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default Loader;
