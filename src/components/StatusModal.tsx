import React from 'react';
import { X } from 'lucide-react';

interface StatusModalProps {
  onClose: () => void;
  onStatusChange: (status: string) => void;
  currentStatus: string;
}

export function StatusModal({ onClose, onStatusChange, currentStatus }: StatusModalProps) {
  const statuses = [
    { value: 'active', label: 'Activo', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'inactive', label: 'Inactivo', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'archived', label: 'Archivado', color: 'bg-red-100 text-red-700 border-red-200' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Modificar Estado</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-3">
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => {
                  onStatusChange(status.value);
                  onClose();
                }}
                className={`w-full p-4 rounded-lg border transition-colors ${
                  currentStatus === status.value
                    ? `${status.color} border-2`
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{status.label}</span>
                  {currentStatus === status.value && (
                    <span className="w-2 h-2 bg-current rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}