import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  patientName: string;
}

export function DeleteConfirmation({ onConfirm, onCancel, patientName }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Está seguro de que desea eliminar al paciente <span className="font-medium">{patientName}</span>? 
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}