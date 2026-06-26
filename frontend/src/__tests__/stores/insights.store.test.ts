import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInsightsStore } from '@/stores/insights.store';
import * as insightsApi from '@/lib/api/insights';
import type { InsightDTO } from '@/lib/api/insights';

vi.mock('@/lib/api/insights', () => ({
  list: vi.fn(),
  validate: vi.fn(),
}));

function makeMockInsight(overrides: Partial<InsightDTO> = {}): InsightDTO {
  return {
    id: `insight-${Math.random().toString(36).slice(2, 8)}`,
    userId: 'user-1',
    category: 'nutrition',
    content: 'Test insight content',
    score: 0.85,
    validationStatus: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  useInsightsStore.setState({
    insights: [],
    total: 0,
    offset: 0,
    limit: 10,
    isLoading: false,
    error: null,
  });
  vi.clearAllMocks();
});

describe('insights.store', () => {
  it('fetchInsights populates list and sets pagination', async () => {
    const data = [makeMockInsight({ id: 'i-1' }), makeMockInsight({ id: 'i-2' })];
    vi.mocked(insightsApi.list).mockResolvedValue({ data, total: 10 });

    await useInsightsStore.getState().fetchInsights('user-1');

    const state = useInsightsStore.getState();
    expect(state.insights).toHaveLength(2);
    expect(state.total).toBe(10);
    expect(state.offset).toBe(2);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loadMore appends to existing insights', async () => {
    const firstBatch = [makeMockInsight({ id: 'i-1' })];
    vi.mocked(insightsApi.list).mockResolvedValueOnce({ data: firstBatch, total: 3 });

    await useInsightsStore.getState().fetchInsights('user-1');
    expect(useInsightsStore.getState().insights).toHaveLength(1);

    const secondBatch = [makeMockInsight({ id: 'i-2' }), makeMockInsight({ id: 'i-3' })];
    vi.mocked(insightsApi.list).mockResolvedValueOnce({ data: secondBatch, total: 3 });

    await useInsightsStore.getState().loadMore('user-1');

    const state = useInsightsStore.getState();
    expect(state.insights).toHaveLength(3);
    expect(state.offset).toBe(3);
    expect(state.isLoading).toBe(false);
  });

  it('validateInsight removes optimistically and calls API', async () => {
    const insight = makeMockInsight({ id: 'i-target' });
    useInsightsStore.setState({ insights: [insight, makeMockInsight({ id: 'i-other' })] });
    vi.mocked(insightsApi.validate).mockResolvedValue(undefined as unknown as InsightDTO);

    await useInsightsStore.getState().validateInsight('i-target', 'approve');

    expect(insightsApi.validate).toHaveBeenCalledWith('i-target', { action: 'approve' });
    expect(useInsightsStore.getState().insights).toHaveLength(1);
    expect(useInsightsStore.getState().insights[0].id).not.toBe('i-target');
  });

  it('validateInsight rolls back on API error', async () => {
    const target = makeMockInsight({ id: 'i-rollback' });
    const other = makeMockInsight({ id: 'i-other' });
    useInsightsStore.setState({ insights: [target, other] });
    vi.mocked(insightsApi.validate).mockRejectedValue(new Error('API error'));

    await useInsightsStore.getState().validateInsight('i-rollback', 'reject');

    // Should have rolled back both items
    expect(useInsightsStore.getState().insights).toHaveLength(2);
    expect(useInsightsStore.getState().insights.some((i) => i.id === 'i-rollback')).toBe(true);
  });
});
