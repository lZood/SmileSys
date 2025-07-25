import React from 'react';
import { X, Calendar, User, Phone, Mail, MapPin, Briefcase, Heart, Thermometer, Stethoscope } from 'lucide-react';
import { Odontogram } from './Odontogram';
import type { Patient } from '../types';

interface PatientDetailsProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientDetails({ patient, onClose }: PatientDetailsProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Historial Clínico del Paciente</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Personal Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre completo</p>
                    <p className="font-medium">{`${patient.first_name} ${patient.last_name}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Edad</p>
                    <p className="font-medium">{patient.age} años</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ocupación</p>
                    <p className="font-medium">{patient.occupation}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Medical History */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Antecedentes Médicos</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h4 className="font-medium">Condiciones Médicas</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(patient.medical_conditions).map(([condition, has]) => (
                      has && (
                        <div key={condition} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full" />
                          <span className="text-sm capitalize">
                            {condition.replace('_', ' ')}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {patient.current_medications?.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Medicamentos Actuales</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.current_medications.map((med, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Vital Signs */}
            {patient.vital_signs && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Signos Vitales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Heart className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">Presión Arterial</p>
                      <p className="font-medium">{patient.vital_signs.blood_pressure}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Temperatura</p>
                      <p className="font-medium">{patient.vital_signs.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Pulso</p>
                      <p className="font-medium">{patient.vital_signs.pulse} bpm</p>
                    </div>
                  </div>
                </div>
                {patient.vital_signs.medical_diagnosis && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Diagnóstico Médico</h4>
                    <p className="text-sm text-gray-700">{patient.vital_signs.medical_diagnosis}</p>
                  </div>
                )}
              </section>
            )}

            {/* Dental Chart */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Odontograma</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Odontogram
                  onChange={() => {}} // Read-only mode
                  initialData={patient.dental_chart || {}}
                  readOnly
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}