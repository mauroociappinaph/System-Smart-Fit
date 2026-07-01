import { FallbackAdapter } from './fallback.adapter';
import { GenerateInsightsPort } from '../../application/ports/out/generate-insights.port';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';

describe('FallbackAdapter', () => {
  let adapter: FallbackAdapter;
  let primaryAdapter: jest.Mocked<GenerateInsightsPort>;
  let fallbackAdapter: jest.Mocked<GenerateInsightsPort>;

  beforeEach(() => {
    primaryAdapter = {
      generateInsights: jest.fn(),
      validateInsight: jest.fn(),
    } as any;

    fallbackAdapter = {
      generateInsights: jest.fn(),
      validateInsight: jest.fn(),
    } as any;

    adapter = new FallbackAdapter(primaryAdapter, fallbackAdapter);
  });

  it('should return results from primary adapter if it succeeds', async () => {
    const mockInsights = [
      AgentInsight.create('u1', 'c1', 'exercise', 'run', 80),
    ];
    primaryAdapter.generateInsights.mockResolvedValue(mockInsights);

    const result = await adapter.generateInsights('u1', 'c1');

    expect(result).toEqual(mockInsights);
    expect(primaryAdapter.generateInsights).toHaveBeenCalled();
    expect(fallbackAdapter.generateInsights).not.toHaveBeenCalled();
  });

  it('should call fallback adapter if primary adapter fails', async () => {
    const mockInsights = [
      AgentInsight.create('u1', 'c1', 'exercise', 'run', 80),
    ];
    primaryAdapter.generateInsights.mockRejectedValue(new Error('NIM Failed'));
    fallbackAdapter.generateInsights.mockResolvedValue(mockInsights);

    const result = await adapter.generateInsights('u1', 'c1');

    expect(result).toEqual(mockInsights);
    expect(primaryAdapter.generateInsights).toHaveBeenCalled();
    expect(fallbackAdapter.generateInsights).toHaveBeenCalled();
  });

  it('should return empty array if both adapters fail', async () => {
    primaryAdapter.generateInsights.mockRejectedValue(new Error('NIM Failed'));
    fallbackAdapter.generateInsights.mockRejectedValue(
      new Error('Mistral Failed'),
    );

    const result = await adapter.generateInsights('u1', 'c1');

    expect(result).toEqual([]);
    expect(primaryAdapter.generateInsights).toHaveBeenCalled();
    expect(fallbackAdapter.generateInsights).toHaveBeenCalled();
  });

  it('should propagate validateInsight calls to both adapters with fallback logic', async () => {
    primaryAdapter.validateInsight.mockRejectedValue(new Error('Primary fail'));
    fallbackAdapter.validateInsight.mockResolvedValue(undefined);

    await adapter.validateInsight('id', 'action');

    expect(primaryAdapter.validateInsight).toHaveBeenCalledWith('id', 'action');
    expect(fallbackAdapter.validateInsight).toHaveBeenCalledWith(
      'id',
      'action',
    );
  });
});
