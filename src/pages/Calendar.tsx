import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  isBefore,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

interface Appointment {
  id: string;
  patient_name?: string;
  time: string;
  date: string;
  treatment_type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from('appointments')
          .select(
            `
          id,
          patient_id,
          date,
          time,
          treatment_type,
          status,
          notes
        `
          )
          .gte('date', startDate)
          .lte('date', endDate)
          .order('time');

      if (appointmentsError) throw appointmentsError;

      // Fetch patient names
      const patientIds = [
        ...new Set(appointmentsData?.map((a) => a.patient_id) || []),
      ];
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Create a map of patient IDs to names
      const patientMap = new Map(
        patientsData?.map((p) => [p.id, `${p.first_name} ${p.last_name}`])
      );

      // Combine appointments with patient names
      const appointmentsWithNames =
        appointmentsData?.map((appointment) => ({
          ...appointment,
          patient_name: patientMap.get(appointment.patient_id),
        })) || [];

      setAppointments(appointmentsWithNames);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // Get the first day of the month
  const firstDayOfMonth = startOfMonth(currentDate);
  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startingDayIndex = firstDayOfMonth.getDay();
  // Adjust for Monday start (if Sunday, move to 6, otherwise subtract 1)
  const adjustedStartingDayIndex =
    startingDayIndex === 0 ? 6 : startingDayIndex - 1;

  // Create array for empty cells before the first day
  const emptyDays = Array(adjustedStartingDayIndex).fill(null);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b">
          {[
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo',
          ].map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the first of the month */}
          {emptyDays.map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-[120px] p-2 border-b border-r bg-gray-50"
            />
          ))}

          {daysInMonth.map((date) => (
            <div
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`min-h-[120px] p-2 border-b border-r relative hover:bg-gray-50 cursor-pointer
                ${isToday(date) ? 'bg-blue-50' : ''}
                ${!isSameMonth(date, currentDate) ? 'text-gray-400' : ''}
                ${
                  selectedDate && isSameDay(date, selectedDate)
                    ? 'ring-2 ring-blue-500 ring-inset'
                    : ''
                }
              `}
            >
              <span
                className={`text-sm ${
                  isToday(date) ? 'font-bold text-blue-600' : 'text-gray-900'
                }`}
              >
                {format(date, 'd')}
              </span>

              {/* Appointment indicators */}
              <div className="mt-1 space-y-1">
                {appointments
                  .filter((apt) => isSameDay(parseISO(apt.date), date))
                  .slice(0, 3)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="text-xs p-1 rounded bg-blue-50 text-blue-700 truncate flex items-center gap-1"
                    >
                      <span>{formatTime(appointment.time)}</span>
                      <span>-</span>
                      <span>{appointment.patient_name}</span>
                    </div>
                  ))}
                {appointments.filter((apt) =>
                  isSameDay(parseISO(apt.date), date)
                ).length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +
                    {appointments.filter((apt) =>
                      isSameDay(parseISO(apt.date), date)
                    ).length - 3}{' '}
                    más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {appointments
                  .filter((apt) => isSameDay(parseISO(apt.date), selectedDate))
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
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
                            <h3 className="font-medium">
                              {appointment.patient_name}
                            </h3>
                            <div className="text-sm text-gray-500">
                              {formatTime(appointment.time)} -{' '}
                              {appointment.treatment_type}
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                    </div>
                  ))}

                {appointments.filter((apt) =>
                  isSameDay(parseISO(apt.date), selectedDate)
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay citas programadas para este día
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
