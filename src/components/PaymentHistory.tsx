import React from 'react';
import { X, DollarSign, Wallet, CreditCard, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'transfer';
  concept: string;
  invoice_number: string;
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
}

interface PaymentHistoryProps {
  onClose: () => void;
  payments: Payment[];
  patientName: string;
}

export function PaymentHistory({ onClose, payments, patientName }: PaymentHistoryProps) {
  const getPaymentMethodIcon = (method: Payment['payment_method']) => {
    switch (method) {
      case 'cash':
        return <Wallet className="h-5 w-5 text-gray-600" />;
      case 'card':
        return <CreditCard className="h-5 w-5 text-gray-600" />;
      case 'transfer':
        return <ArrowUpRight className="h-5 w-5 text-gray-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
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

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Historial de Pagos</h2>
              <p className="text-sm text-gray-500 mt-1">{patientName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Pagado</p>
                <p className="text-2xl font-bold text-blue-700">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">Total de Pagos</p>
                <p className="text-2xl font-bold text-blue-700">{payments.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {payments.length > 0 ? (
              payments
                .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                .map(payment => (
                  <div
                    key={payment.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          {getPaymentMethodIcon(payment.payment_method)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{payment.concept}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        <span>Factura: {payment.invoice_number}</span>
                      </div>
                      <div>
                        {format(new Date(payment.payment_date), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                    </div>
                    {payment.notes && (
                      <p className="mt-2 text-sm text-gray-600 border-t pt-2">{payment.notes}</p>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay pagos registrados para este paciente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}