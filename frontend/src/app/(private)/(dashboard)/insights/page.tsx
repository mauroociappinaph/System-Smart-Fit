'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { useInsightsStore } from '@/stores/insights.store';
import type { InsightDTO } from '@/lib/api/insights';

const CATEGORY_LABELS: Record<string, string> = {
  nutrition: 'Nutrición',
  training: 'Entrenamiento',
  recovery: 'Recuperación',
  health: 'Salud',
  habit: 'Hábito',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function scoreColor(score: number): string {
  if (score >= 0.8) return 'bg-green-100 text-green-800';
  if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function InsightCard({
  insight,
  onValidate,
  isValidating,
}: {
  insight: InsightDTO;
  onValidate: (action: 'approve' | 'reject') => void;
  isValidating: boolean;
}) {
  const isPending = insight.validationStatus === 'pending';

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {categoryLabel(insight.category)}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${scoreColor(insight.score)}`}
        >
          {Math.round(insight.score * 100)}%
        </span>
        {!isPending && (
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
            {statusLabel(insight.validationStatus)}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="mb-3 text-sm leading-relaxed text-zinc-700">
        {insight.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <time className="text-xs text-zinc-400">
          {formatDate(insight.createdAt)}
        </time>

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onValidate('approve')}
              disabled={isValidating}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              Aprobar
            </button>
            <button
              onClick={() => onValidate('reject')}
              disabled={isValidating}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function InsightsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    insights,
    total,
    limit,
    isLoading,
    error,
    fetchInsights,
    validateInsight,
  } = useInsightsStore();

  const [isValidating, setIsValidating] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchInsights(user.id);
      setPage(1);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleValidate(
    id: string,
    action: 'approve' | 'reject',
  ) {
    setIsValidating(id);
    try {
      await validateInsight(id, action);
      toast.success(
        action === 'approve'
          ? 'Insight aprobado correctamente'
          : 'Insight rechazado correctamente',
      );
    } catch {
      toast.error('Error al validar el insight');
    } finally {
      setIsValidating(null);
    }
  }

  function handleNextPage() {
    if (!user) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchInsights(user.id, (nextPage - 1) * limit);
  }

  function handlePrevPage() {
    if (!user) return;
    setPage(1);
    fetchInsights(user.id);
  }

  function handleRetry() {
    if (!user) return;
    fetchInsights(user.id);
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = page;

  // ── Loading ──────────────────────────────────
  if (isLoading && insights.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
          <p className="text-sm text-zinc-500">Cargando insights...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────
  if (error && insights.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900">
            Algo salió mal
          </h2>
          <p className="mb-6 text-sm text-zinc-500">{error}</p>
          <button
            onClick={handleRetry}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────
  if (!isLoading && insights.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 text-4xl">💡</div>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900">
            Todavía no hay insights
          </h2>
          <p className="text-sm text-zinc-500">
        Los insights generados por Smart Fit aparecen acá apenas estén listos.
          </p>
        </div>
      </div>
    );
  }

  // ── List ─────────────────────────────────────
  return (
    <section>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-bold text-zinc-900">Insights</h1>
        <p className="text-sm text-zinc-500">
          Recomendaciones personalizadas generadas por Smart Fit
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onValidate={(action) => handleValidate(insight.id, action)}
            isValidating={isValidating === insight.id}
          />
        ))}
      </div>

      {/* Loading indicator for loadMore */}
      {isLoading && insights.length > 0 && (
        <div className="mt-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm text-zinc-500">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Total count */}
      {total > 0 && (
        <p className="mt-4 text-center text-xs text-zinc-400">
          {total} insight{total !== 1 ? 's' : ''} en total
        </p>
      )}
    </section>
  );
}
