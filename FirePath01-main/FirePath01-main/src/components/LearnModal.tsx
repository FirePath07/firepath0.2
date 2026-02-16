interface LearnModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const LearnModal = ({ isOpen, onClose, title, content }: LearnModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
        <div className="p-8 border-b">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto">
            <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition">
                Got it!
            </button>
        </div>
      </div>
    </div>
  );
};
