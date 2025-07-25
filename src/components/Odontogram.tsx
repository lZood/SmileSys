import React, { useState, useCallback, memo } from 'react';
import { X } from 'lucide-react';
import type { ToothCondition, DentalTreatment } from '../types';

const CONDITION_LABELS = {
  missing: 'Ausente',
  cavity: 'Caries',
  restoration: 'Restauración',
  trauma: 'Traumatismo',
  pain: 'Dolor',
  malocclusion: 'Mal oclusión',
  extraction: 'Extracción',
  defectiveRestoration: 'Restauración defectuosa',
  mobility: 'Movilidad',
  fixedProsthesis: 'Prótesis fija',
  removableProsthesis: 'Prótesis removible',
  foodImpact: 'Impacto de alimentos'
};

const TREATMENT_COLORS = {
  'restoration': '#60A5FA', // blue-400
  'extraction': '#F87171', // red-400
  'cleaning': '#34D399', // emerald-400
  'root-canal': '#A78BFA', // violet-400
  'crown': '#FBBF24', // amber-400
  'bridge': '#818CF8', // indigo-400
  'implant': '#F472B6', // pink-400
  'sealant': '#2DD4BF', // teal-400
  'filling': '#4ADE80', // green-400
  'veneer': '#FB923C', // orange-400
  'whitening': '#E879F9', // fuchsia-400
  'other': '#9CA3AF', // gray-400
};

const CONDITION_COLORS = {
  missing: '#DC2626', // red-600
  cavity: '#D97706', // amber-600
  restoration: '#2563EB', // blue-600
  trauma: '#DB2777', // pink-600
  pain: '#DC2626', // red-600
  malocclusion: '#7C3AED', // violet-600
  extraction: '#B91C1C', // red-700
  defectiveRestoration: '#9333EA', // purple-600
  mobility: '#059669', // emerald-600
  fixedProsthesis: '#4F46E5', // indigo-600
  removableProsthesis: '#0891B2', // cyan-600
  foodImpact: '#CA8A04', // yellow-600
  default: '#1F2937', // gray-800
}

interface ToothProps {
  number: number;
  conditions: ToothCondition;
  onClick: (number: number) => void;
  selected: boolean;
}

const Tooth = memo<ToothProps>(({ number, conditions, onClick, selected }) => {
  // Count active conditions
  const activeConditions = Object.entries(conditions)
    .filter(([key, value]) => value && key !== 'treatments')
    .map(([key]) => key);

  const getToothColor = () => {
    if (activeConditions.length === 0) {
      return CONDITION_COLORS.default;
    }

    if (activeConditions.length === 1) {
      return CONDITION_COLORS[activeConditions[0] as keyof typeof CONDITION_COLORS] || CONDITION_COLORS.default;
    }

    // For multiple conditions, create a gradient
    return CONDITION_COLORS.default;
  };

  const handleClick = () => {
    onClick(number);
  };

  const treatments = conditions.treatments || [];
  const latestTreatment = treatments[treatments.length - 1];

  // Get active conditions with their labels
  const activeConditionsWithLabels = Object.entries(conditions)
    .filter(([key, value]) => value && key !== 'treatments')
    .map(([key]) => CONDITION_LABELS[key as keyof typeof CONDITION_LABELS]);

  // Create tooltip content
  const tooltipContent = [
    ...activeConditionsWithLabels,
    ...(treatments.map(t => `${t.type} (${t.date}) - ${t.status}`))
  ].join('\n');

  return (
    <div 
      className={`relative cursor-pointer group ${selected ? 'scale-110' : ''}`}
      onClick={handleClick}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-pre-line">
          <div className="font-medium mb-1">Diente {number}</div>
          {activeConditionsWithLabels.length > 0 && (
            <>
              <div className="text-gray-300 text-xs mb-1">Condiciones:</div>
              {activeConditionsWithLabels.map((label, i) => (
                <div key={i} className="text-xs">{label}</div>
              ))}
            </>
          )}
          {treatments.length > 0 && (
            <>
              <div className="text-gray-300 text-xs mt-2 mb-1">Tratamientos:</div>
              {treatments.map((t, i) => (
                <div key={i} className="text-xs">
                  {t.type} ({t.date}) - {t.status}
                </div>
              ))}
            </>
          )}
          {activeConditionsWithLabels.length === 0 && treatments.length === 0 && (
            <div className="text-xs text-gray-300">Sin condiciones ni tratamientos</div>
          )}
        </div>
        <div className="w-3 h-3 bg-gray-900 absolute left-1/2 -bottom-1.5 -translate-x-1/2 rotate-45"></div>
      </div>
      <svg
        viewBox="0 0 100 100"
        style={{ color: getToothColor(), width: '2.5rem', height: '2.5rem' }}
        className={`transition-transform duration-200 ease-in-out ${
          activeConditions.length > 1 ? 'gradient-tooth' : ''
        }`}
      >
        <path
          d="M50 5 C20 5 10 30 10 60 C10 80 30 95 50 95 C70 95 90 80 90 60 C90 30 80 5 50 5"
          fill={activeConditions.length > 1 ? 'url(#gradient)' : 'currentColor'}
          stroke={selected ? '#4F46E5' : '#666'}
          strokeWidth="2"
        />
        {activeConditions.length > 1 && (
          <defs>
            <linearGradient id={`gradient-${number}`} x1="0" y1="0" x2="1" y2="1">
              {activeConditions.map((condition, index) => (
                <stop
                  key={condition}
                  offset={`${(index * 100) / (activeConditions.length - 1)}%`}
                  stopColor={CONDITION_COLORS[condition as keyof typeof CONDITION_COLORS] || CONDITION_COLORS.default}
                />
              ))}
            </linearGradient>
          </defs>
        )}
        {treatments.map((treatment) => (
          <g key={treatment.id}>
            {treatment.type === 'restoration' && (
              <rect
                x="35"
                y="35"
                width="30"
                height="30"
                fill={TREATMENT_COLORS[treatment.type]}
                opacity={treatment.status === 'completed' ? 1 : 0.5}
              />
            )}
            {treatment.type === 'crown' && (
              <path
                d="M50 15 L65 25 L65 75 L35 75 L35 25 Z"
                fill={TREATMENT_COLORS[treatment.type]}
                opacity={treatment.status === 'completed' ? 1 : 0.5}
              />
            )}
            {/* Add more treatment visualizations here */}
          </g>
        ))}
      </svg>
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium">
        {number}
      </span>
      {treatments.length > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
});

Tooth.displayName = 'Tooth';

interface OdontogramProps {
  onChange: (toothData: Record<number, ToothCondition>) => void;
  initialData?: Record<number, ToothCondition>;
  readOnly?: boolean;
}

export function Odontogram({ onChange, initialData = {}, readOnly = false }: OdontogramProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teethConditions, setTeethConditions] = useState<Record<number, ToothCondition>>(initialData);
  
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const handleToothClick = useCallback((number: number) => {
    if (readOnly) return;
    setSelectedTooth(prev => prev === number ? null : number);
  }, [readOnly]);

  const handleConditionSelect = useCallback((condition: keyof ToothCondition) => {
    if (!selectedTooth) return;

    setTeethConditions(prev => {
      const newConditions = {
        ...prev,
        [selectedTooth]: {
          ...prev[selectedTooth],
          [condition]: !prev[selectedTooth]?.[condition]
        }
      };
      onChange(newConditions);
      return newConditions;
    });
  }, [selectedTooth, onChange]);

  const conditions: Array<{ key: keyof ToothCondition; label: string }> = [
    { key: 'missing', label: 'Ausente' },
    { key: 'restoration', label: 'Restauración' },
    { key: 'cavity', label: 'Caries' },
    { key: 'trauma', label: 'Traumatismo' },
    { key: 'pain', label: 'Dolor' },
    { key: 'malocclusion', label: 'Mal oclusión' },
    { key: 'extraction', label: 'Extracción' },
    { key: 'defectiveRestoration', label: 'Restauración defectuosa' },
    { key: 'mobility', label: 'Movilidad' },
    { key: 'fixedProsthesis', label: 'Prótesis fija' },
    { key: 'removableProsthesis', label: 'Prótesis removible' },
    { key: 'foodImpact', label: 'Impacto de alimentos' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="flex justify-center items-center gap-1">
          {upperTeeth.map(number => (
            <Tooth
              key={number}
              number={number}
              conditions={teethConditions[number] || {}}
              onClick={handleToothClick}
              selected={selectedTooth === number}
            />
          ))}
        </div>

        <div className="flex justify-center items-center gap-1">
          {lowerTeeth.map(number => (
            <Tooth
              key={number}
              number={number}
              conditions={teethConditions[number] || {}}
              onClick={handleToothClick}
              selected={selectedTooth === number}
            />
          ))}
        </div>
      </div>

      {selectedTooth && (
        <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg border-t p-4 z-[60]">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Diente {selectedTooth}</h3>
              {!readOnly && (
                <button
                  onClick={() => setSelectedTooth(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Treatment History */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Historial de Tratamientos</h4>
              <div className="space-y-2">
                {teethConditions[selectedTooth]?.treatments?.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: TREATMENT_COLORS[treatment.type] }}
                        />
                        <span className="font-medium capitalize">{treatment.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{treatment.date}</span>
                      <span className={`block text-xs mt-1 ${
                        treatment.status === 'completed' ? 'text-green-600' :
                        treatment.status === 'in-progress' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {treatment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!readOnly && <div className="grid grid-cols-3 gap-2">
            {conditions.map(({ key, label }) => (
              <button
                type="button"
                key={key}
                onClick={() => handleConditionSelect(key)}
                className={`p-2 text-sm rounded-lg transition-colors ${
                  teethConditions[selectedTooth]?.[key]
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
            </div>}
          </div>
        </div>
      )}
    </div>
  );
}