import type { EditHistory } from '../types';

interface HistoryModalProps {
  history: EditHistory[];
  memberName: string;
  onClose: () => void;
}

export default function HistoryModal({ history, memberName, onClose }: HistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Edit History - {memberName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        {history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-700">
                  {new Date(h.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium capitalize">{h.field}</span> changed
                </div>
                <div className="text-sm mt-1">
                  <span className="text-red-600">"{h.oldValue}"</span>
                  {' → '}
                  <span className="text-green-600">"{h.newValue}"</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No edit history available</p>
        )}
      </div>
    </div>
  );
}
