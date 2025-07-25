import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Calendar, UserCog, Trash2, Filter, DollarSign, FileText, FilePlus } from 'lucide-react';
import { PatientForm } from '../components/PatientForm';
import { PatientDetails } from '../components/PatientDetails';
import { StatusModal } from '../components/StatusModal';
import { DeleteConfirmation } from '../components/DeleteConfirmation';
import { OrthodonticConsentForm } from '../components/OrthodonticConsentForm';
import { AppointmentHistory } from '../components/AppointmentHistory';
import { PaymentHistory } from '../components/PaymentHistory';
import { supabase } from '../lib/supabase';
import type { Patient } from '../types';

interface Appointment {
  id: string;
  date: string;
  time: string;
  treatment_type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

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

function Patients() {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState<Patient | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<Patient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Patient | null>(null);
  const [showAppointments, setShowAppointments] = useState<Patient | null>(null);
  const [showPayments, setShowPayments] = useState<Patient | null>(null);
  const [showConsentForm, setShowConsentForm] = useState<Patient | null>(null);
  const [existingConsent, setExistingConsent] = useState<{ pdf_url: string } | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientPayments, setPatientPayments] = useState<Payment[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const defaultFilters = {
    status: 'all',
    gender: 'all',
    ageRange: 'all'
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [patientConsents, setPatientConsents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPatients();
    fetchPatientConsents();
  }, []);

  const fetchPatientConsents = async () => {
    try {
      const { data, error } = await supabase
        .from('orthodontic_consents')
        .select('patient_id');

      if (error) throw error;

      const consentsMap = (data || []).reduce((acc: Record<string, boolean>, consent) => {
        acc[consent.patient_id] = true;
        return acc;
      }, {});

      setPatientConsents(consentsMap);
    } catch (error) {
      console.error('Error fetching patient consents:', error);
    }
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
    if (showFilters) {
      // Reset filters when closing the filter menu
      setFilters(defaultFilters);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleAddPatient = async (formData: any) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!userData.user) {
        throw new Error('No authenticated user');
      }

      // Transform form data to match database schema
      const patientData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: parseInt(formData.age),
        gender: formData.gender.toLowerCase(), // Ensure lowercase to match DB constraint
        occupation: formData.occupation,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        medical_conditions: formData.medical_conditions,
        pregnancy_trimester: formData.pregnancy_trimester ? parseInt(formData.pregnancy_trimester) : null,
        current_medications: formData.current_medications ? formData.current_medications.split(',').map((m: string) => m.trim()) : [],
        vital_signs: {
          blood_pressure: formData.blood_pressure,
          pulse: formData.pulse ? parseInt(formData.pulse) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          indicated_anesthesia: formData.indicated_anesthesia,
          medical_diagnosis: formData.medical_diagnosis
        },
        dental_chart: formData.dental_chart || {}
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select();

      if (error) throw error;

      console.log('Patient added successfully:', data);
      setShowForm(false);
      fetchPatients();
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const handleStatusChange = async (patientId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', patientId);

      if (error) throw error;
      fetchPatients();
    } catch (error) {
      console.error('Error updating patient status:', error);
    }
  };

  const handleDeletePatient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPatients();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const handleViewAppointments = async (patient: Patient) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setPatientAppointments(data || []);
      setShowAppointments(patient);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
    }
  };

  const handleViewPayments = async (patient: Patient) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('patient_id', patient.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPatientPayments(data || []);
      setShowPayments(patient);
    } catch (error) {
      console.error('Error fetching patient payments:', error);
    }
  };

  const handleConsentClick = async (patient: Patient) => {
    try {
      const { data, error } = await supabase
        .from('orthodontic_consents')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No consent found, show the form to create one
          setShowConsentForm(patient);
        } else {
          throw error;
        }
      } else if (data) {
        // Consent exists, open it in a new tab
        window.open(data.pdf_url, '_blank');
      } else {
        // No consent found, show the form
        setShowConsentForm(patient);
      }
    } catch (error) {
      console.error('Error checking consent form:', error);
      setShowConsentForm(patient);
    }
  };

  const handleConsentSubmit = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('orthodontic_consents')
        .insert([{
          patient_id: showConsentForm?.id,
          ...formData
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Update the consents map
      setPatientConsents(prev => ({
        ...prev,
        [showConsentForm?.id || '']: true
      }));

      // Open the newly created consent
      if (data) {
        window.open(data.pdf_url, '_blank');
      }

      setShowConsentForm(null);
    } catch (error) {
      console.error('Error saving consent form:', error);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchMatch = 
      `${patient.first_name} ${patient.last_name} ${patient.email}`.toLowerCase()
      .includes(searchTerm.toLowerCase());

    let filterMatch = true;

    if (filters.status !== 'all') {
      filterMatch = filterMatch && patient.status === filters.status;
    }
    if (filters.gender !== 'all') {
      filterMatch = filterMatch && patient.gender === filters.gender;
    }
    if (filters.ageRange !== 'all') {
      const age = patient.age;
      switch (filters.ageRange) {
        case 'under18':
          filterMatch = filterMatch && age < 18;
          break;
        case '18to30':
          filterMatch = filterMatch && age >= 18 && age <= 30;
          break;
        case '31to50':
          filterMatch = filterMatch && age >= 31 && age <= 50;
          break;
        case 'over50':
          filterMatch = filterMatch && age > 50;
          break;
      }
    }

    return searchMatch && filterMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Agregar Paciente
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleToggleFilters}
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
                className="w-full rounded-lg border-gray-300 bg-white"
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full rounded-lg border-gray-300 bg-white"
              >
                <option value="all">Todos</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de edad
              </label>
              <select
                value={filters.ageRange}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
                className="w-full rounded-lg border-gray-300 bg-white"
              >
                <option value="all">Todos</option>
                <option value="under18">Menor de 18</option>
                <option value="18to30">18-30 años</option>
                <option value="31to50">31-50 años</option>
                <option value="over50">Mayor de 50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="p-4">Nombre</th>
              <th className="p-4">Email</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Última Visita</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="border-b">
                <td className="p-4">
                  <div className="font-medium">{`${patient.first_name} ${patient.last_name}`}</div>
                  <div className="text-sm text-gray-500">ID: {patient.id}</div>
                </td>
                <td className="p-4">{patient.email}</td>
                <td className="p-4">{patient.phone}</td>
                <td className="p-4">-</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    patient.status === 'active' ? 'bg-green-100 text-green-600' :
                    patient.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    patient.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {patient.status === 'active' ? 'Activo' :
                     patient.status === 'inactive' ? 'Inactivo' :
                     patient.status === 'pending' ? 'Pendiente' :
                     'Archivado'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => setShowDetails(patient)}
                      title="Ver detalles"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleViewAppointments(patient)}
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Ver historial de citas"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleViewPayments(patient)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Ver historial de pagos"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleConsentClick(patient)}
                      className={`p-2 ${
                        patientConsents[patient.id]
                          ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                          : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                      } rounded-lg transition-colors`}
                      title={patientConsents[patient.id] ? 'Ver consentimiento' : 'Generar consentimiento'}
                    >
                      {patientConsents[patient.id] ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <FilePlus className="h-5 w-5" />
                      )}
                    </button>
                    <button 
                      className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                      onClick={() => setShowStatusModal(patient)}
                      title="Modificar estado"
                    >
                      <UserCog className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(patient)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar paciente"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <PatientForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddPatient}
        />
      )}

      {showDetails && (
        <PatientDetails
          patient={showDetails}
          onClose={() => setShowDetails(null)}
        />
      )}

      {showStatusModal && (
        <StatusModal
          currentStatus={showStatusModal.status || 'active'}
          onStatusChange={(status) => handleStatusChange(showStatusModal.id, status)}
          onClose={() => setShowStatusModal(null)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          patientName={`${showDeleteConfirm.first_name} ${showDeleteConfirm.last_name}`}
          onConfirm={() => handleDeletePatient(showDeleteConfirm.id)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {showAppointments && (
        <AppointmentHistory
          appointments={patientAppointments}
          patientName={`${showAppointments.first_name} ${showAppointments.last_name}`}
          onClose={() => setShowAppointments(null)}
        />
      )}

      {showPayments && (
        <PaymentHistory
          payments={patientPayments}
          patientName={`${showPayments.first_name} ${showPayments.last_name}`}
          onClose={() => setShowPayments(null)}
        />
      )}

      {/* Orthodontic Consent Form */}
      {showConsentForm && (
        <OrthodonticConsentForm
          patientName={`${showConsentForm.first_name} ${showConsentForm.last_name}`}
          onClose={() => setShowConsentForm(null)}
          onSubmit={handleConsentSubmit}
        />
      )}
    </div>
  );
}

export default Patients;