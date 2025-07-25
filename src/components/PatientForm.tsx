import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Odontogram } from './Odontogram';

interface PatientFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function PatientForm({ onClose, onSubmit }: PatientFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    age: '',
    gender: '',
    occupation: '',
    phone: '',
    address: '',
    email: '',

    // Medical History
    medical_conditions: {
      diabetes: false,
      heart_disease: false,
      hypertension: false,
      hypotension: false,
      seizures: false,
      arthritis: false,
      allergies: false,
      bleeding_disorders: false,
      hepatitis: false,
      hiv: false,
      tuberculosis: false,
    },
    pregnancy_trimester: null,
    current_medications: '',

    // Vital Signs
    blood_pressure: '',
    pulse: '',
    temperature: '',
    indicated_anesthesia: '',
    medical_diagnosis: '',

    // Oral Examination
    soft_tissues: '',
    alveolar_process: '',
    tmj_condition: '',
    occlusion: '',
    periodontal_condition: '',
    bacterial_plaque: false,
    supragingival_calculus: false,
    subgingival_calculus: false,
    radiological_needs: '',
    study_models_needed: false,
    
    // Dental Chart
    dental_chart: {} as Record<number, {
      missing?: boolean;
      restoration?: boolean;
      cavity?: boolean;
      trauma?: boolean;
      pain?: boolean;
      malocclusion?: boolean;
      extraction?: boolean;
      defectiveRestoration?: boolean;
      mobility?: boolean;
      fixedProsthesis?: boolean;
      removableProsthesis?: boolean;
      foodImpact?: boolean;
    }>
  });

  const inputClasses = "mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const checkboxClasses = "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";
  const checkboxLabelClasses = "ml-2 text-sm text-gray-700";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Clear error when field is modified
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name.includes('medical_conditions.')) {
      const condition = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        medical_conditions: {
          ...prev.medical_conditions,
          [condition]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleOdontogramChange = (toothData: Record<number, any>) => {
    setFormData(prev => ({
      ...prev,
      dental_chart: toothData
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Los apellidos son requeridos';
    }
    if (!formData.age) {
      newErrors.age = 'La edad es requerida';
    }
    if (!formData.gender) {
      newErrors.gender = 'El género es requerido';
    }
    if (!formData.occupation.trim()) {
      newErrors.occupation = 'La ocupación es requerida';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'El domicilio es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.medical_diagnosis.trim()) {
      newErrors.medical_diagnosis = 'El diagnóstico médico es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    
    // Validate current step before proceeding
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      return;
    }
    
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const handlePreviousStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses}>Nombre</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={inputClasses}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>
        <div>
          <label className={labelClasses}>Apellidos</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={inputClasses}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>
        <div>
          <label className={labelClasses}>Edad</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={inputClasses}
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
        </div>
        <div>
          <label className={labelClasses}>Género</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Seleccionar</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
        <div>
          <label className={labelClasses}>Ocupación</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          {errors.occupation && (
            <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
          )}
        </div>
        <div>
          <label className={labelClasses}>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClasses}>Domicilio</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClasses}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Antecedentes Médicos</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">¿Padece alguna de las siguientes enfermedades?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries({
              diabetes: 'Diabetes',
              heart_disease: 'Cardiopatías',
              hypertension: 'Hipertensión',
              hypotension: 'Hipotensión',
              seizures: 'Convulsiones',
              arthritis: 'Artritis',
              allergies: 'Alergias',
              bleeding_disorders: 'Problemas hemorrágicos',
              hepatitis: 'Hepatitis',
              hiv: 'VIH/SIDA',
              tuberculosis: 'Tuberculosis'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center bg-gray-50 p-3 rounded-lg">
                <input
                  type="checkbox"
                  name={`medical_conditions.${key}`}
                  checked={formData.medical_conditions[key as keyof typeof formData.medical_conditions]}
                  onChange={handleChange}
                  className={checkboxClasses}
                />
                <label className={checkboxLabelClasses}>{label}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Trimestre de embarazo (si aplica)</label>
            <select
              name="pregnancy_trimester"
              value={formData.pregnancy_trimester || ''}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">No aplica</option>
              <option value="1">Primer trimestre</option>
              <option value="2">Segundo trimestre</option>
              <option value="3">Tercer trimestre</option>
            </select>
          </div>
          <div>
            <label className={labelClasses}>Medicamentos actuales</label>
            <input
              type="text"
              name="current_medications"
              value={formData.current_medications}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Separar por comas"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Signos Vitales y Diagnóstico</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Presión arterial</label>
          <input
            type="text"
            name="blood_pressure"
            value={formData.blood_pressure}
            onChange={handleChange}
            className={inputClasses}
            placeholder="120/80"
          />
        </div>
        <div>
          <label className={labelClasses}>Pulso</label>
          <input
            type="number"
            name="pulse"
            value={formData.pulse}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Temperatura</label>
          <input
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            className={inputClasses}
            step="0.1"
          />
        </div>
        <div>
          <label className={labelClasses}>Anestesia indicada</label>
          <input
            type="text"
            name="indicated_anesthesia"
            value={formData.indicated_anesthesia}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClasses}>Diagnóstico médico</label>
          <textarea
            name="medical_diagnosis"
            value={formData.medical_diagnosis}
            onChange={handleChange}
            rows={3}
            className={inputClasses}
            required
          />
          {errors.medical_diagnosis && (
            <p className="mt-1 text-sm text-red-600">{errors.medical_diagnosis}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Odontograma</h3>
      <p className="text-sm text-gray-600 mb-6">
        Haga clic en un diente para registrar su condición. Puede seleccionar múltiples condiciones para cada diente.
      </p>
      <Odontogram
        onChange={handleOdontogramChange}
        initialData={formData.dental_chart}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Registro de Paciente</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="flex justify-between pt-6 border-t sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={currentStep === 1}
              >
                Anterior
              </button>
              <div>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Guardar Paciente
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}