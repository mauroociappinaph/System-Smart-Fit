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
  /** Selected month filter (1-12) or undefined for "all" */
  month?: number;
  /** Start of date range filter (epoch ms). Mutually exclusive with month. */
  startDate?: number;
  /** End of date range filter (epoch ms). Mutually exclusive with month. */
  endDate?: number;
  /** @internal used to prevent stale rollback in concurrent validateInsight calls */
  _validateVersion: number;

  fetchInsights: (userId: string, pageOffset?: number) => Promise<void>;
  loadMore: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
  setMonth: (userId: string, month?: number) => Promise<void>;
  setDateRange: (userId: string, startDate?: number, endDate?: number) => Promise<void>;
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
    const { month, startDate, endDate } = get();
    set({ isLoading: true, error: null, offset: startOffset });
    try {
      const res = await insightsApi.list(userId, startOffset, get().limit, month, startDate, endDate);
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
    const { offset, limit, isLoading, month, startDate, endDate } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const res = await insightsApi.list(userId, offset, limit, month, startDate, endDate);
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

  /** Re-fetches the first page — useful after validation or manual refresh */
  refresh: async (userId: string) => {
    const { limit, month, startDate, endDate } = get();
    set({ isLoading: true, error: null, offset: 0 });
    try {
      const res = await insightsApi.list(userId, 0, limit, month, startDate, endDate);
      set({
        insights: res.data,
        total: res.total,
        offset: res.data.length,
        isLoading: false,
      });
    } catch {
      set({ error: 'Error al refrescar insights', isLoading: false });
    }
  },

  /** Changes month filter and re-fetches from page 1. Clears date range. */
  setMonth: async (userId: string, month?: number) => {
    set({ month, startDate: undefined, endDate: undefined, isLoading: true, error: null, offset: 0 });
    try {
      const res = await insightsApi.list(userId, 0, get().limit, month);
      set({
        insights: res.data,
        total: res.total,
        offset: res.data.length,
        isLoading: false,
      });
    } catch {
      set({ error: 'Error al filtrar insights', isLoading: false });
    }
  },

  /** Sets date range filter and re-fetches from page 1. Clears month. */
  setDateRange: async (userId: string, startDate?: number, endDate?: number) => {
    set({ startDate, endDate, month: undefined, isLoading: true, error: null, offset: 0 });
    try {
      const res = await insightsApi.list(userId, 0, get().limit, undefined, startDate, endDate);
      set({
        insights: res.data,
        total: res.total,
        offset: res.data.length,
        isLoading: false,
      });
    } catch {
      set({ error: 'Error al filtrar por fechas', isLoading: false });
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
