'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';

interface FieldErrors {
  email?: string;
  password?: string;
  name?: string;
  weightKg?: string;
  heightCm?: string;
  birthDate?: string;
  goal?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [goal, setGoal] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Formato de correo inválido';
    }

    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }

    if (weightKg && (isNaN(Number(weightKg)) || Number(weightKg) <= 0)) {
      errors.weightKg = 'Ingresa un peso válido en kg';
    }
    if (heightCm && (isNaN(Number(heightCm)) || Number(heightCm) <= 0)) {
      errors.heightCm = 'Ingresa una altura válida en cm';
    }

    if (birthDate) {
      const parsed = new Date(birthDate).getTime();
      if (isNaN(parsed)) {
        errors.birthDate = 'Fecha de nacimiento inválida';
      } else if (parsed > Date.now()) {
        errors.birthDate = 'La fecha no puede ser futura';
      } else if (parsed < new Date('1900-01-01').getTime()) {
        errors.birthDate = 'Fecha de nacimiento no válida';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const dto: {
      email: string;
      password: string;
      name: string;
      weightKg?: number;
      heightCm?: number;
      birthDate?: number;
      goal?: string;
    } = {
      email: email.trim(),
      password,
      name: name.trim(),
    };

    if (weightKg) dto.weightKg = Number(weightKg);
    if (heightCm) dto.heightCm = Number(heightCm);
    if (birthDate) {
      const ts = new Date(birthDate).getTime();
      if (!isNaN(ts)) dto.birthDate = ts;
    }
    if (goal.trim()) dto.goal = goal.trim();

    const user = await signup(dto);
    const storeError = useAuthStore.getState().error;
    if (user) {
      toast.success('Registro exitoso');
      router.push('/insights');
    } else if (storeError) {
      toast.error(storeError);
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900">
          Crear Cuenta
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError('email');
              }}
              className={inputClass('email')}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError('name');
              }}
              className={inputClass('name')}
              placeholder="Tu nombre"
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError('password');
              }}
              className={inputClass('password')}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label
              htmlFor="weightKg"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Peso (kg)
            </label>
            <input
              id="weightKg"
              type="number"
              value={weightKg}
              onChange={(e) => {
                setWeightKg(e.target.value);
                clearError('weightKg');
              }}
              className={inputClass('weightKg')}
              placeholder="Opcional"
              min="0"
              step="0.1"
            />
            {fieldErrors.weightKg && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.weightKg}
              </p>
            )}
          </div>

          {/* Height */}
          <div>
            <label
              htmlFor="heightCm"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Altura (cm)
            </label>
            <input
              id="heightCm"
              type="number"
              value={heightCm}
              onChange={(e) => {
                setHeightCm(e.target.value);
                clearError('heightCm');
              }}
              className={inputClass('heightCm')}
              placeholder="Opcional"
              min="0"
              step="1"
            />
            {fieldErrors.heightCm && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.heightCm}
              </p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label
              htmlFor="birthDate"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Fecha de nacimiento
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                clearError('birthDate');
              }}
              className={inputClass('birthDate')}
            />
            {fieldErrors.birthDate && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.birthDate}
              </p>
            )}
          </div>

          {/* Goal */}
          <div>
            <label
              htmlFor="goal"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Objetivo
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                clearError('goal');
              }}
              className={inputClass('goal')}
              placeholder="Opcional — ej. perder peso, ganar músculo"
              rows={3}
            />
            {fieldErrors.goal && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.goal}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
