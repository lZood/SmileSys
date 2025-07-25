import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Package,
  Activity,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Bluetooth as Tooth,
  Clock,
  Stethoscope,
  Syringe,
  Pill,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  lowStockItems: number;
  recentAppointments: Array<{
    id: string;
    patient_name: string;
    date: string;
    time: string;
    treatment_type: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  }>;
  treatmentStats: {
    cleanings: number;
    extractions: number;
    fillings: number;
    orthodontics: number;
  };
  upcomingTreatments: Array<{
    type: string;
    count: number;
  }>;
  inventoryAlerts: Array<{
    name: string;
    quantity: number;
    minimum_quantity: number;
  }>;
  patientGrowth: number;
  appointmentGrowth: number;
  inventoryAlert: number;
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    lowStockItems: 0,
    recentAppointments: [],
    treatmentStats: {
      cleanings: 0,
      extractions: 0,
      fillings: 0,
      orthodontics: 0,
    },
    upcomingTreatments: [],
    inventoryAlerts: [],
    patientGrowth: 0,
    appointmentGrowth: 0,
    inventoryAlert: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    fetchDashboardStats();
  }, [authLoading]);

  const fetchDashboardStats = async () => {
    if (!session) {
      setError('Por favor inicie sesión para ver el dashboard');
      setLoading(false);
      return;
    }

    setError(null);
    try {
      // Get total patients and calculate growth
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('created_at');

      if (patientsError) throw patientsError;

      const totalPatients = patients?.length || 0;
      const lastMonthPatients =
        patients?.filter(
          (p) =>
            new Date(p.created_at) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0;
      const patientGrowth =
        totalPatients > 0 ? (lastMonthPatients / totalPatients) * 100 : 0;

      // Get today's appointments
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(
          `
          id,
          patient_id,
          date,
          time,
          treatment_type,
          status
        `
        )
        .eq('date', today);

      if (appointmentsError) throw appointmentsError;

      // Get patient names for appointments
      const patientIds = [
        ...new Set(appointments?.map((a) => a.patient_id) || []),
      ];
      const { data: appointmentPatients, error: appointmentPatientsError } =
        await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .in('id', patientIds);

      if (appointmentPatientsError) throw appointmentPatientsError;

      // Create a map of patient IDs to names
      const patientMap = new Map(
        appointmentPatients?.map((p) => [
          p.id,
          `${p.first_name} ${p.last_name}`,
        ])
      );

      // Get recent appointments with patient names
      const recentAppointments =
        appointments
          ?.map((appointment) => ({
            ...appointment,
            patient_name:
              patientMap.get(appointment.patient_id) || 'Unknown Patient',
          }))
          .slice(0, 3) || [];

      // Calculate appointment growth
      const lastMonthAppointments =
        appointments?.filter(
          (a) =>
            new Date(a.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0;
      const appointmentGrowth = appointments?.length
        ? (lastMonthAppointments / appointments.length) * 100
        : 0;

      // Get low stock items
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('status', 'low_stock')
        .limit(5);

      if (inventoryError) throw inventoryError;

      // Get treatment statistics
      const { data: treatments, error: treatmentsError } = await supabase
        .from('appointments')
        .select('treatment_type')
        .gte(
          'date',
          format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        );

      if (treatmentsError) throw treatmentsError;

      const treatmentStats = {
        cleanings:
          treatments?.filter((t) => t.treatment_type === 'Limpieza Dental')
            .length || 0,
        extractions:
          treatments?.filter((t) => t.treatment_type === 'Extracción').length ||
          0,
        fillings:
          treatments?.filter((t) => t.treatment_type === 'Empaste').length || 0,
        orthodontics:
          treatments?.filter((t) => t.treatment_type === 'Ortodoncia').length ||
          0,
      };

      // Get upcoming treatments
      const upcomingTreatments = Object.entries({
        'Limpieza Dental':
          treatments?.filter((t) => t.treatment_type === 'Limpieza Dental')
            .length || 0,
        Extracción:
          treatments?.filter((t) => t.treatment_type === 'Extracción').length ||
          0,
        Empaste:
          treatments?.filter((t) => t.treatment_type === 'Empaste').length || 0,
        Ortodoncia:
          treatments?.filter((t) => t.treatment_type === 'Ortodoncia').length ||
          0,
      })
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalPatients,
        todayAppointments: appointments?.length || 0,
        lowStockItems: inventory?.length || 0,
        recentAppointments,
        treatmentStats,
        upcomingTreatments,
        inventoryAlerts:
          inventory?.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            minimum_quantity: item.minimum_quantity,
          })) || [],
        patientGrowth,
        appointmentGrowth,
        inventoryAlert: inventory?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(
        'Error al cargar los datos del dashboard. Por favor intente de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inicio</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span
              className={`flex items-center ${
                stats.patientGrowth >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {stats.patientGrowth >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {Math.abs(stats.patientGrowth).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm">Total Pacientes</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.totalPatients}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <span
              className={`flex items-center ${
                stats.appointmentGrowth >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {stats.appointmentGrowth >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {Math.abs(stats.appointmentGrowth).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm">Citas Hoy</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.todayAppointments}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-gray-500 flex items-center">
              <Activity className="h-4 w-4" />
              Este mes
            </span>
          </div>
          <h3 className="text-gray-600 text-sm">Citas Completadas</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {
              stats.recentAppointments.filter((a) => a.status === 'completed')
                .length
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Alerta
            </span>
          </div>
          <h3 className="text-gray-600 text-sm">Items con Stock Bajo</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.lowStockItems}
          </p>
        </div>
      </div>

      {/* Treatment Statistics */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Estadísticas de Tratamientos
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">Últimos 30 días</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Tooth className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-600">Limpiezas</span>
            </div>
            <p className="text-2xl font-semibold text-blue-700">
              {stats.treatmentStats.cleanings}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Syringe className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-600">Extracciones</span>
            </div>
            <p className="text-2xl font-semibold text-red-700">
              {stats.treatmentStats.extractions}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">Empastes</span>
            </div>
            <p className="text-2xl font-semibold text-green-700">
              {stats.treatmentStats.fillings}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-600">Ortodoncia</span>
            </div>
            <p className="text-2xl font-semibold text-purple-700">
              {stats.treatmentStats.orthodontics}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas de Inventario
          </h2>
          <div className="space-y-4">
            {stats.inventoryAlerts.length > 0 ? (
              stats.inventoryAlerts.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-red-700">{item.name}</p>
                    <p className="text-sm text-red-600">
                      Stock actual: {item.quantity} (Mínimo:{' '}
                      {item.minimum_quantity})
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No hay alertas de inventario
              </p>
            )}
          </div>
        </div>

        {/* Popular Treatments */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tratamientos Más Frecuentes
          </h2>
          <div className="space-y-4">
            {stats.upcomingTreatments.map((treatment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      index === 0
                        ? 'bg-blue-100 text-blue-600'
                        : index === 1
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Tooth className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{treatment.type}</span>
                </div>
                <span className="text-gray-600">
                  {treatment.count} pacientes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Citas Recientes
        </h2>
        <div className="overflow-x-auto relative">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3">Patient</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Treatment</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats.recentAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b">
                  <td className="py-3">{appointment.patient_name}</td>
                  <td>
                    {format(new Date(appointment.date), 'dd MMM, yyyy', {
                      locale: es,
                    })}
                  </td>
                  <td>
                    {format(
                      new Date(`2000-01-01T${appointment.time}`),
                      'hh:mm a'
                    )}
                  </td>
                  <td>{appointment.treatment_type}</td>
                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay citas recientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
