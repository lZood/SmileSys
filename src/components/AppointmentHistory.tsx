import React from 'react';
import { X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: string;
  date: string;
  time: string;
  treatment_type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface AppointmentHistoryProps {
  onClose: () => void;
  appointments: Appointment[];
  patientName: string;
}

export function AppointmentHistory({ onClose, appointments, patientName }: AppointmentHistoryProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'in-progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Historial de Citas</h2>
              <p className="text-sm text-gray-500 mt-1">{patientName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {appointments.length > 0 ? (
              appointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(appointment => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(appointment.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                          </div>
                          <div className="font-medium">
                            {formatTime(appointment.time)} - {appointment.treatment_type}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay citas registradas para este paciente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}