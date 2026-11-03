import React from 'react';
import { CRISIS_RESOURCES } from '../constants';
import { CrisisResource } from '../types';

interface CrisisAlertProps {
  onDismiss?: () => void;
}

const CrisisAlert: React.FC<CrisisAlertProps> = ({ onDismiss }) => {
  return (
    <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 p-4 rounded-xl shadow-xs mb-4 animate-fade-in">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-red-900 dark:text-red-200">
              Kami mendeteksi Anda mungkin sedang mengalami masa sulit.
            </h3>
            <div className="mt-2 text-xs sm:text-sm text-red-800 dark:text-red-300">
              <p className="mb-2 font-medium">Anda tidak sendirian. Silakan hubungi layanan bantuan profesional segera:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                {CRISIS_RESOURCES.map((resource: CrisisResource, idx: number) => (
                  <li key={idx}>
                    <span className="font-bold">{resource.name}:</span>{' '}
                    <a href={`tel:${resource.number}`} className="underline font-bold hover:text-red-950 dark:hover:text-white">
                      {resource.number}
                    </a>
                    <span className="block text-xs text-red-700/90 dark:text-red-300/80">{resource.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 hover:text-red-700 transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup peringatan"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CrisisAlert;