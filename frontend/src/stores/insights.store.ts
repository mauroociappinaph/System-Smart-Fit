import { create } from 'zustand';
import type { InsightDTO } from '@/lib/api/insights';
import * as insightsApi from '@/lib/api/insights';

export interface InsightsState {
  insights: InsightDTO[];
  total: number;
  offset: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  /** @internal used to prevent stale rollback in concurrent validateInsight calls */
  _validateVersion: number;

  fetchInsights: (userId: string, pageOffset?: number) => Promise<void>;
  loadMore: (userId: string) => Promise<void>;
  validateInsight: (
    id: string,
    action: 'approve' | 'reject' | 'discard',
  ) => Promise<void>;
}

export const useInsightsStore = create<InsightsState>((set, get) => ({
  insights: [],
  total: 0,
  offset: 0,
  limit: 10,
  isLoading: false,
  error: null,
  _validateVersion: 0,

  fetchInsights: async (userId: string, pageOffset?: number) => {
    const startOffset = pageOffset ?? 0;
    set({ isLoading: true, error: null, offset: startOffset });
    try {
      const res = await insightsApi.list(userId, startOffset, get().limit);
      set({
        insights: res.data,
        total: res.total,
        offset: startOffset + res.data.length,
        isLoading: false,
      });
    } catch {
      set({ error: 'Error al cargar insights', isLoading: false });
    }
  },

  loadMore: async (userId: string) => {
    const { offset, limit, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const res = await insightsApi.list(userId, offset, limit);
      set((state) => ({
        insights: [...state.insights, ...res.data],
        total: res.total,
        offset: state.offset + res.data.length,
        isLoading: false,
      }));
    } catch {
      set({ error: 'Error al cargar más insights', isLoading: false });
    }
  },

  validateInsight: async (
    id: string,
    action: 'approve' | 'reject' | 'discard',
  ) => {
    const entry = get()._validateVersion + 1;
    set({ _validateVersion: entry });

    const previous = get().insights;
    // Optimistic remove
    set((state) => ({
      insights: state.insights.filter((i) => i.id !== id),
    }));

    try {
      await insightsApi.validate(id, { action });
    } catch (err) {
      // Only rollback if no newer validation has started (prevents stale rollback)
      if (get()._validateVersion === entry) {
        set({ insights: previous });
      }
      throw err; // Propagate so component can show toast
    }
  },
}));
