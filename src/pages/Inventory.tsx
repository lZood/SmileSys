import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Search, X, Package, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InventoryActions } from '../components/InventoryActions';
import { EditInventoryItem } from '../components/EditInventoryItem';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minimum_quantity: number;
  unit_price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier: string;
  last_ordered_at: string;
}

interface NewItemFormData {
  name: string;
  description: string;
  category: string;
  quantity: number;
  minimum_quantity: number;
  unit_price: number;
  supplier: string;
}

const CATEGORIES = [
  'Material Restaurador',
  'Instrumental',
  'Anestésicos',
  'Higiene',
  'Ortodoncia',
  'Desechables',
  'Equipamiento',
  'Otros'
];

function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  const [formData, setFormData] = useState<NewItemFormData>({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    minimum_quantity: 10,
    unit_price: 0,
    supplier: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minimum_quantity' || name === 'unit_price'
        ? parseFloat(value)
        : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    if (formData.quantity < 0) {
      newErrors.quantity = 'La cantidad no puede ser negativa';
    }
    if (formData.minimum_quantity < 0) {
      newErrors.minimum_quantity = 'La cantidad mínima no puede ser negativa';
    }
    if (formData.unit_price < 0) {
      newErrors.unit_price = 'El precio no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const status = formData.quantity === 0 ? 'out_of_stock' :
                     formData.quantity <= formData.minimum_quantity ? 'low_stock' :
                     'in_stock';

      const { error } = await supabase
        .from('inventory_items')
        .insert([{
          ...formData,
          status,
          last_ordered_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setShowNewItemForm(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        quantity: 0,
        minimum_quantity: 10,
        unit_price: 0,
        supplier: ''
      });
      fetchInventory();
    } catch (error) {
      console.error('Error adding inventory item:', error);
    }
  };

  const handleUpdateStock = async (quantity: number) => {
    if (!selectedItem) return;

    // Validate that the new quantity won't be negative
    const newQuantity = selectedItem.quantity + quantity;
    if (newQuantity < 0) {
      console.error('Error: Cannot have negative stock');
      return;
    }

    try {
      const status = newQuantity === 0 ? 'out_of_stock' :
                     newQuantity <= selectedItem.minimum_quantity ? 'low_stock' :
                     'in_stock';

      const { error } = await supabase
        .from('inventory_items')
        .update({
          quantity: newQuantity,
          status,
          last_ordered_at: quantity > 0 ? new Date().toISOString() : selectedItem.last_ordered_at
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setShowActions(false);
      fetchInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          minimum_quantity: formData.minimum_quantity,
          unit_price: formData.unit_price,
          supplier: formData.supplier
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setShowEdit(false);
      setShowActions(false);
      fetchInventory();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-700';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-700';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'En Stock';
      case 'low_stock':
        return 'Stock Bajo';
      case 'out_of_stock':
        return 'Sin Stock';
      default:
        return status;
    }
  };

  const filteredItems = items.filter(item => {
    const searchMatch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

    let filterMatch = true;

    if (filters.category !== 'all') {
      filterMatch = filterMatch && item.category === filters.category;
    }
    if (filters.status !== 'all') {
      filterMatch = filterMatch && item.status === filters.status;
    }

    return searchMatch && filterMatch;
  });

  const lowStockItems = items.filter(item => item.status === 'low_stock');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <button
          onClick={() => setShowNewItemForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Agregar Artículo
        </button>
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Alerta de Stock Bajo</span>
          </div>
          <p className="mt-1 text-sm text-orange-700">
            {lowStockItems.length} artículos están con stock bajo. Por favor revise y reordene según sea necesario.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="space-y-4">
          <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'hover:bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            <Filter className="h-5 w-5" />
            Filtros
          </button>
          </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="in_stock">En Stock</option>
                <option value="low_stock">Stock Bajo</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando inventario...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="p-4">Artículo</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Precio Unitario</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Último Pedido</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 cursor-pointer" onClick={() => {
                    setSelectedItem(item);
                    setShowActions(true);
                  }}>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">
                    <div className="font-medium">{item.quantity} unidades</div>
                    <div className="text-sm text-gray-500">
                      Mínimo: {item.minimum_quantity}
                    </div>
                  </td>
                  <td className="p-4">
                    ${item.unit_price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.last_ordered_at ? (
                      new Date(item.last_ordered_at).toLocaleDateString()
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Item Modal */}
      {showNewItemForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Nuevo Artículo</h2>
                </div>
                <button
                  onClick={() => setShowNewItemForm(false)}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proveedor
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad Mínima
                    </label>
                    <input
                      type="number"
                      name="minimum_quantity"
                      value={formData.minimum_quantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.minimum_quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.minimum_quantity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.unit_price && (
                      <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewItemForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Guardar Artículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {showActions && selectedItem && (
        <InventoryActions
          item={selectedItem}
          onClose={() => {
            setShowActions(false);
            setSelectedItem(null);
          }}
          onUpdateStock={handleUpdateStock}
          onEdit={() => {
            setShowEdit(true);
            setShowActions(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEdit && selectedItem && (
        <EditInventoryItem
          item={selectedItem}
          onClose={() => {
            setShowEdit(false);
            setSelectedItem(null);
          }}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}

export default Inventory;