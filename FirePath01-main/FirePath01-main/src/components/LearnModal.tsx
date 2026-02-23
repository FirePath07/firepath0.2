import type { ReactNode } from 'react';

interface LearnModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
}

export const LearnModal = ({ isOpen, onClose, title, content }: LearnModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 transition-colors duration-300">
        <div className="p-8 border-b dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{content}</div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
