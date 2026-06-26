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

  fetchInsights: (userId: string) => Promise<void>;
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

  fetchInsights: async (userId: string) => {
    set({ isLoading: true, error: null, offset: 0 });
    try {
      const res = await insightsApi.list(userId, 0, get().limit);
      set({
        insights: res.data,
        total: res.total,
        offset: res.data.length,
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
      set({ isLoading: false });
    }
  },

  validateInsight: async (
    id: string,
    action: 'approve' | 'reject' | 'discard',
  ) => {
    const previous = get().insights;
    // Optimistic remove
    set((state) => ({
      insights: state.insights.filter((i) => i.id !== id),
    }));

    try {
      await insightsApi.validate(id, { action });
    } catch {
      // Rollback on failure
      set({ insights: previous });
    }
  },
}));
