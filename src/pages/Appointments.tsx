import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, ChevronRight, Search, X, ChevronDown } from 'lucide-react';
import { format, isToday, addDays, isBefore, isAfter, isThisWeek, startOfToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  time: string;
  date: string;
  treatment_type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface AppointmentFormData {
  patient_id: string;
  date: string;
  time: string;
  duration: number;
  treatment_type: string;
  notes: string;
}

const TREATMENT_TYPES = ['Limpieza Dental', 'Extracción', 'Empaste', 'Revisión', 'Ortodoncia', 'Blanqueamiento', 'Otro'];

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonthAppointments, setCurrentMonthAppointments] = useState<Appointment[]>([]);
  const [showNewAppointment, setShowNewAppointment] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [showReschedule, setShowReschedule] = React.useState(false);
  const [rescheduleData, setRescheduleData] = React.useState({
    date: '',
    time: ''
  });
  const [showAllUpcoming, setShowAllUpcoming] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [formData, setFormData] = React.useState<AppointmentFormData>({
    patient_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    treatment_type: '',
    notes: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setError(null);
    try {
      const now = new Date();

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          date,
          time,
          treatment_type,
          status,
          notes
        `)
        .order('date')
        .order('time');

      if (appointmentsError) throw appointmentsError;

      const updatePromises = [];
      for (const appointment of appointmentsData || []) {
        if (appointment.status === 'scheduled') {
          const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
          const oneHourAgo = new Date(now.getTime() - 60 * 60000);
          
          // If appointment is happening now (started less than 1 hour ago)
          if (appointmentDateTime > oneHourAgo && appointmentDateTime <= now) {
            updatePromises.push(supabase
              .from('appointments')
              .update({ status: 'in-progress' })
              .eq('id', appointment.id));
          }
          // If appointment time has passed (more than 1 hour ago), set to completed
          else if (appointmentDateTime <= oneHourAgo) {
            updatePromises.push(supabase
              .from('appointments')
              .update({ status: 'completed' })
              .eq('id', appointment.id));
            appointment.status = 'completed';
          }
        }
      }

      // Wait for all updates to complete
      if (updatePromises.length > 0) {
        const results = await Promise.all(updatePromises);
        // Check for any errors in the update operations
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          console.error('Errors updating appointments:', errors);
        }
      }

      // Fetch patient names for all appointments
      const patientIds = [...new Set(appointmentsData?.map(a => a.patient_id) || [])];
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Create a map of patient IDs to names
      const patientMap = new Map(
        patientsData?.map(p => [p.id, `${p.first_name} ${p.last_name}`])
      );

      // Combine appointments with patient names
      const appointmentsWithNames = appointmentsData?.map(appointment => ({
        ...appointment,
        patient_name: patientMap.get(appointment.patient_id)
      })) || [];

      setAppointments(appointmentsWithNames);
      
      // Filter appointments for current month
      const currentMonthAppointments = appointmentsWithNames.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.getMonth() === now.getMonth() && 
               appointmentDate.getFullYear() === now.getFullYear();
      });
      setCurrentMonthAppointments(currentMonthAppointments);

    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Error al cargar las citas. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (showNewAppointment) {
      fetchPatients();
    }
  }, [showNewAppointment]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email, phone')
        .order('first_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patient_id: patient.id }));
    setSearchTerm('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Seleccione un paciente';
    }
    if (!formData.date) {
      newErrors.date = 'Seleccione una fecha';
    }
    if (!formData.time) {
      newErrors.time = 'Seleccione una hora';
    }
    if (!formData.treatment_type) {
      newErrors.treatment_type = 'Seleccione un tipo de tratamiento';
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!userData.user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: formData.patient_id,
          doctor_id: userData.user.id,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          status: 'scheduled',
          notes: formData.notes,
          treatment_type: formData.treatment_type
        }]);

      if (error) throw error;

      // Reset form and close modal
      setFormData({
        patient_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        duration: 30,
        treatment_type: '',
        notes: ''
      });
      setSelectedPatient(null);
      setShowNewAppointment(false);

      // Refresh appointments list
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleAppointmentClick = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      date: appointment.date,
      time: appointment.time
    });
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          date: rescheduleData.date,
          time: rescheduleData.time,
          status: 'scheduled'
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      // Refresh appointments
      fetchAppointments();
      setSelectedAppointment(null);
      setShowReschedule(false);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: Appointment['status']) => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      // Refresh appointments
      fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name} ${patient.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

  const renderAppointment = (appointment: Appointment) => (
    <div
      key={appointment.id}
      className="p-4 hover:bg-gray-50 border-b last:border-b-0 group cursor-pointer"
      onClick={() => handleAppointmentClick(appointment)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{appointment.patient_name}</h3>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(new Date(`${appointment.date}T${appointment.time}`), 'dd/MM/yyyy hh:mm a')} - {appointment.treatment_type}
            </div>
            {appointment.notes && (
              <p className="text-sm text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {appointment.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
          <ChevronRight className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
        <button onClick={() => setShowNewAppointment(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5" />
          Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm relative">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {loading ? 'Cargando citas...' : 'Citas de Hoy'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {format(startOfToday(), "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Cargando citas...</p>
              </div>
            ) : (
              <div className="divide-y">
                {appointments
                  .filter(appointment => isToday(new Date(`${appointment.date}T${appointment.time}`)))
                  .map(renderAppointment)}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-6 relative">
          {/* This Week's Appointments */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Próximos 7 días</h2>
              <p className="text-sm text-gray-500 mt-1">
                {format(addDays(startOfToday(), 1), "EEEE d", { locale: es })} - {
                  format(addDays(startOfToday(), 7), "EEEE d", { locale: es })
                } de {format(startOfToday(), "MMMM", { locale: es })}
              </p>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Cargando citas...</p>
              </div>
            ) : (
              <>
                {error ? (
                  <div className="p-4 bg-red-50">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {appointments
                      .filter(appointment => 
                        isAfter(
                          new Date(`${appointment.date}T${appointment.time}`),
                         addDays(startOfToday(), 1)
                        ) &&
                        isBefore(
                          new Date(`${appointment.date}T${appointment.time}`),
                          addDays(startOfToday(), 8)
                        )
                      )
                      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                      .slice(0, 4)
                      .map(renderAppointment)}
                  </div>
                )}
              </>
            )}
            <div className="p-4 border-t">
                <button
                  onClick={() => setShowAllUpcoming(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Ver todas las citas
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
          </div>

          {/* Monthly Overview */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Vista Mensual</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Total de citas</span>
                  <span className="font-medium text-gray-900">{currentMonthAppointments.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Completadas</span>
                  <span className="font-medium text-green-600">
                    {currentMonthAppointments.filter(a => a.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Canceladas</span>
                  <span className="font-medium text-red-600">
                    {currentMonthAppointments.filter(a => a.status === 'cancelled').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Pendientes</span>
                  <span className="font-medium text-yellow-600">
                    {currentMonthAppointments.filter(a => a.status === 'scheduled').length}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  {currentMonthAppointments.length > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ 
                        width: `${(currentMonthAppointments.filter(a => 
                          a.status === 'completed' || a.status === 'in-progress'
                        ).length / currentMonthAppointments.length) * 100}%` 
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nueva Cita</h2>
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                        onClick={() => setSelectedPatient(null)}
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
                  {errors.patient_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.time && (
                      <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                    )}
                  </div>
                </div>

                {/* Treatment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Tratamiento
                  </label>
                  <select
                    name="treatment_type"
                    value={formData.treatment_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tratamiento</option>
                    {TREATMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.treatment_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.treatment_type}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notas adicionales sobre la cita..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewAppointment(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agendar Cita
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Detalles de la Cita</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900">Paciente</h3>
                  <p className="text-gray-600">{selectedAppointment.patient_name}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Fecha y Hora</h3>
                  <p className="text-gray-600">
                    {format(new Date(`${selectedAppointment.date}T${selectedAppointment.time}`), 
                      "d 'de' MMMM 'a las' hh:mm a", 
                      { locale: es }
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Tratamiento</h3>
                  <p className="text-gray-600">{selectedAppointment.treatment_type}</p>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900">Notas</h3>
                    <p className="text-gray-600">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Reschedule Section */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Reprogramar Cita</h3>
                  {showReschedule ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Nueva Fecha</label>
                          <input
                            type="date"
                            value={rescheduleData.date}
                            onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Nueva Hora</label>
                          <input
                            type="time"
                            value={rescheduleData.time}
                            onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReschedule(false)}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleReschedule}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Confirmar Reprogramación
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReschedule(true)}
                      className="w-full p-3 text-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Reprogramar esta cita
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Estado</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStatusUpdate('in-progress')}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        selectedAppointment.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      En Progreso
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        selectedAppointment.status === 'completed'
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Completada
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        selectedAppointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-700 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Cancelada
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('scheduled')}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        selectedAppointment.status === 'scheduled'
                          ? 'bg-yellow-100 text-yellow-700 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Programada
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Upcoming Appointments Modal */}
      {showAllUpcoming && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Próximas Citas</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(addDays(startOfToday(), 1), "EEEE d", { locale: es })} - {
                      format(addDays(startOfToday(), 7), "EEEE d", { locale: es })
                    } de {format(startOfToday(), "MMMM", { locale: es })}
                  </p>
                </div>
                <button
                  onClick={() => setShowAllUpcoming(false)}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="divide-y max-h-[60vh] overflow-y-auto">
                {appointments
                  .filter(appointment => 
                    isAfter(
                     parseISO(`${appointment.date}T${appointment.time}`),
                     addDays(startOfToday(), 1)
                    ) &&
                    isBefore(
                     parseISO(`${appointment.date}T${appointment.time}`),
                     addDays(startOfToday(), 8)
                    )
                  )
                  .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                  .map(appointment => (
                    <div
                      key={appointment.id}
                      className="py-4 first:pt-0 last:pb-0 hover:bg-gray-50 cursor-pointer px-4"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{appointment.patient_name}</h3>
                            <div className="text-sm text-gray-500">
                              {format(new Date(`${appointment.date}T${appointment.time}`), 
                                "EEEE d 'de' MMMM 'a las' hh:mm a",
                                { locale: es }
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.treatment_type}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Appointments