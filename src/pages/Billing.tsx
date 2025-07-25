import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, DollarSign, Receipt, CreditCard, Wallet, FileText, ArrowUpRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Payment {
  id: string;
  patient_id: string;
  patient_name?: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'transfer';
  concept: string;
  invoice_number: string;
  status: 'paid' | 'pending' | 'cancelled';
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

function Billing() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all'
  });

  const [formData, setFormData] = useState({
    patient_id: '',
    amount: '',
    payment_method: '',
    concept: '',
    notes: ''
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patient_id: patient.id }));
    setSearchTerm('');
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name} ${patient.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchPayments();
    fetchPatients();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch patient names
      const patientIds = [...new Set(paymentsData?.map(p => p.patient_id) || [])];
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Create a map of patient IDs to names
      const patientMap = new Map(
        patientsData?.map(p => [p.id, `${p.first_name} ${p.last_name}`])
      );

      // Combine payments with patient names
      const paymentsWithNames = paymentsData?.map(payment => ({
        ...payment,
        patient_name: patientMap.get(payment.patient_id)
      })) || [];

      setPayments(paymentsWithNames);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email')
        .order('first_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          patient_id: formData.patient_id,
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          concept: formData.concept,
          payment_date: new Date().toISOString(),
          status: 'paid',
          invoice_number: `INV-${Date.now()}`
        }]);

      if (error) throw error;

      setShowNewPayment(false);
      setFormData({
        patient_id: '',
        amount: '',
        payment_method: '',
        concept: '',
        notes: ''
      });
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentMethodIcon = (method: Payment['payment_method']) => {
    switch (method) {
      case 'cash':
        return <Wallet className="h-5 w-5" />;
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'transfer':
        return <ArrowUpRight className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Facturación y Pagos</h1>
        <button
          onClick={() => setShowNewPayment(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Registrar Pago
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos del Mes</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${payments
                  .filter(p => p.status === 'paid' && new Date(p.payment_date).getMonth() === new Date().getMonth())
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pagos Registrados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {payments.filter(p => p.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Facturas Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente o número de factura..."
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
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periodo
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todo</option>
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.patient_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(payment.payment_date), "d 'de' MMMM, yyyy", { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.concept}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-500">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <span className="ml-2">
                        {payment.payment_method === 'cash' ? 'Efectivo' :
                         payment.payment_method === 'card' ? 'Tarjeta' :
                         'Transferencia'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'paid' ? 'Pagado' :
                       payment.status === 'pending' ? 'Pendiente' :
                       'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Modal */}
      {showNewPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Pago</h2>
                <button
                  onClick={() => {
                    setShowNewPayment(false);
                    setSelectedPatient(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente
                  </label>
                  {selectedPatient ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{`${selectedPatient.first_name} ${selectedPatient.last_name}`}</p>
                        <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(null);
                          setFormData(prev => ({ ...prev, patient_id: '' }));
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar paciente..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {searchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-60 overflow-auto">
                          {filteredPatients.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={() => handlePatientSelect(patient)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex flex-col"
                            >
                              <span className="font-medium">
                                {patient.first_name} {patient.last_name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {patient.email}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount and Payment Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar método</option>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                    </select>
                  </div>
                </div>

                {/* Concept */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={formData.concept}
                    onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewPayment(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Registrar Pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;