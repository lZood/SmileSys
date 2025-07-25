import React from 'react';
import { X, Plus, Minus, Edit2, AlertTriangle } from 'lucide-react';

interface InventoryActionsProps {
  onClose: () => void;
  onUpdateStock: (quantity: number) => void;
  onEdit: () => void;
  item: {
    id: string;
    name: string;
    quantity: number;
    minimum_quantity: number;
    unit_price: number;
  };
}

export function InventoryActions({ onClose, onUpdateStock, onEdit, item }: InventoryActionsProps) {
  const [stockChange, setStockChange] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const handleStockUpdate = () => {
    // Clear any previous error
    setError(null);

    // Check if the update would result in negative stock
    if (item.quantity + stockChange < 0) {
      setError('No hay suficiente stock disponible');
      return;
    }

    onUpdateStock(stockChange);
    setStockChange(0);
  };

  const handleStockChange = (change: number) => {
    const newValue = stockChange + change;
    // Prevent decreasing stock below available quantity
    if (item.quantity + newValue < 0) {
      return;
    }
    setStockChange(newValue);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Acciones de Inventario</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Current Stock Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stock actual:</span>
                  <span className="font-medium">{item.quantity} unidades</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stock mínimo:</span>
                  <span className="font-medium">{item.minimum_quantity} unidades</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Precio unitario:</span>
                  <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                </div>
              </div>
              {item.quantity <= item.minimum_quantity && (
                <div className="mt-3 flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Stock bajo - Se recomienda reordenar</span>
                </div>
              )}
            </div>

            {/* Stock Update */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Actualizar Stock</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStockChange(-1)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={stockChange}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    if (item.quantity + newValue >= 0) {
                      setStockChange(newValue);
                    }
                  }}
                  className="w-20 text-center px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleStockChange(1)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  onClick={handleStockUpdate}
                  disabled={stockChange === 0}
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Actualizar Stock
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Edit Item */}
            <div>
              <button
                onClick={onEdit}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit2 className="h-5 w-5" />
                Editar Información
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}