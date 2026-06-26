'use client';

import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { submit } from '@/lib/api/telemetry';
import type { TelemetryDTO } from '@/lib/api/telemetry';

type MetricType = TelemetryDTO['metricType'];

interface FieldErrors {
  metricType?: string;
  value?: string;
  unit?: string;
  timestamp?: string;
}

const METRIC_OPTIONS: { value: MetricType; label: string }[] = [
  { value: 'heart_rate', label: 'Frecuencia cardíaca' },
  { value: 'blood_pressure', label: 'Presión arterial' },
  { value: 'weight', label: 'Peso' },
  { value: 'glucose', label: 'Glucosa' },
  { value: 'sleep_hours', label: 'Horas de sueño' },
  { value: 'steps', label: 'Pasos' },
];

const UNIT_BY_TYPE: Record<MetricType, string> = {
  heart_rate: 'bpm',
  blood_pressure: 'mmHg',
  weight: 'kg',
  glucose: 'mg/dL',
  sleep_hours: 'h',
  steps: 'pasos',
};

function nowISO(): string {
  const now = new Date();
  // datetime-local requires YYYY-MM-DDTHH:mm format
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function TelemetryPage() {
  const user = useAuthStore((s) => s.user);

  const [metricType, setMetricType] = useState<MetricType>('heart_rate');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(UNIT_BY_TYPE['heart_rate']);
  const [timestamp, setTimestamp] = useState(nowISO);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleMetricChange(type: MetricType) {
    setMetricType(type);
    setUnit(UNIT_BY_TYPE[type]);
    setFieldErrors((prev) => ({ ...prev, metricType: undefined }));
  }

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!metricType) {
      errors.metricType = 'Selecciona un tipo de métrica';
    }

    const parsedValue = Number(value);
    if (!value.trim()) {
      errors.value = 'El valor es obligatorio';
    } else if (isNaN(parsedValue) || parsedValue <= 0) {
      errors.value = 'Ingresa un valor mayor a 0';
    }

    if (!unit.trim()) {
      errors.unit = 'La unidad es obligatoria';
    }

    if (!timestamp) {
      errors.timestamp = 'La fecha y hora son obligatorias';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!user) {
      toast.error('Debes iniciar sesión para registrar una métrica');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: TelemetryDTO = {
        userId: user.id,
        metricType,
        value: Number(value),
        unit,
        deviceTimestamp: new Date(timestamp).getTime(),
      };
      await submit(dto);
      toast.success('Métrica registrada correctamente');
      // Reset form
      setValue('');
      setUnit(UNIT_BY_TYPE['heart_rate']);
      setTimestamp(nowISO());
      setMetricType('heart_rate');
      setFieldErrors({});
    } catch {
      toast.error('Error al registrar la métrica');
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearError(field: keyof FieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const inputClass = (field: keyof FieldErrors) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-zinc-900 ${
      fieldErrors[field] ? 'border-red-400 focus:ring-red-400' : 'border-zinc-300'
    }`;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-bold text-zinc-900">Registrar Métrica</h1>
        <p className="text-sm text-zinc-500">
          Ingresa una nueva medición para tu seguimiento personal
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6"
      >
        {/* Metric type */}
        <div>
          <label
            htmlFor="metricType"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Tipo de métrica <span className="text-red-500">*</span>
          </label>
          <select
            id="metricType"
            value={metricType}
            onChange={(e) => handleMetricChange(e.target.value as MetricType)}
            onBlur={() => clearError('metricType')}
            className={inputClass('metricType')}
          >
            {METRIC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {fieldErrors.metricType && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.metricType}
            </p>
          )}
        </div>

        {/* Value */}
        <div>
          <label
            htmlFor="value"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Valor <span className="text-red-500">*</span>
          </label>
          <input
            id="value"
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              clearError('value');
            }}
            className={inputClass('value')}
            placeholder="Ej. 72"
            min="0"
            step="any"
          />
          {fieldErrors.value && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.value}</p>
          )}
        </div>

        {/* Unit (auto-filled but editable) */}
        <div>
          <label
            htmlFor="unit"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Unidad <span className="text-red-500">*</span>
          </label>
          <input
            id="unit"
            type="text"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              clearError('unit');
            }}
            className={inputClass('unit')}
          />
          {fieldErrors.unit && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.unit}</p>
          )}
        </div>

        {/* Timestamp */}
        <div>
          <label
            htmlFor="timestamp"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Fecha y hora <span className="text-red-500">*</span>
          </label>
          <input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => {
              setTimestamp(e.target.value);
              clearError('timestamp');
            }}
            className={inputClass('timestamp')}
          />
          {fieldErrors.timestamp && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.timestamp}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isSubmitting ? 'Registrando...' : 'Registrar Métrica'}
        </button>
      </form>
    </section>
  );
}
