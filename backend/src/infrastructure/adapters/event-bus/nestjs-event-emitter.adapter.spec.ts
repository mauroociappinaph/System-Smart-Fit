import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NESTJS_EVENT_EMITTER_ADAPTER_PROVIDER } from './nestjs-event-emitter.adapter';
import { EVENT_BUS_PORT, EventBusPort } from '../../../application/ports/out/event-bus.port';
import { DomainEvent } from '../../../shared/domain/domain-event.interface';

// Test domain event
class TestEvent implements DomainEvent<{ test: string }> {
  public readonly eventName = 'test.event';
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: { test: string },
  ) {}
}

describe('EventBusPort Contract', () => {
  let adapter: EventBusPort;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let module: TestingModule;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});

    const mockEventEmitter = {
      emitAsync: jest.fn().mockResolvedValue(undefined),
    };

    module = await Test.createTestingModule({
      providers: [
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        NESTJS_EVENT_EMITTER_ADAPTER_PROVIDER,
      ],
    }).compile();

    adapter = module.get<EventBusPort>(EVENT_BUS_PORT);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('publish', () => {
    it('should emit event with correct name and payload', async () => {
      const event = new TestEvent('evt-1', 'corr-1', Date.now(), { test: 'data' });

      await adapter.publish(event);

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('test.event', event);
    });

    it('should reject when emitter fails', async () => {
      const event = new TestEvent('evt-2', 'corr-2', Date.now(), { test: 'data' });
      eventEmitter.emitAsync.mockRejectedValueOnce(new Error('Emitter error'));

      await expect(adapter.publish(event)).rejects.toThrow('Emitter error');
    });

    it('should log debug on successful publish', async () => {
      const event = new TestEvent('evt-3', 'corr-3', Date.now(), { test: 'data' });

      await adapter.publish(event);

      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        expect.stringContaining('Event published: test.event'),
        expect.objectContaining({ eventId: 'evt-3', correlationId: 'corr-3' }),
      );
    });
  });

  describe('publishAll', () => {
    it('should emit all events in parallel', async () => {
      const events = [
        new TestEvent('evt-1', 'corr-1', Date.now(), { test: '1' }),
        new TestEvent('evt-2', 'corr-2', Date.now(), { test: '2' }),
        new TestEvent('evt-3', 'corr-3', Date.now(), { test: '3' }),
      ];

      await adapter.publishAll(events);

      expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(3);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('test.event', events[0]);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('test.event', events[1]);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('test.event', events[2]);
    });

    it('should wait for all emissions to complete', async () => {
      const events = [
        new TestEvent('evt-1', 'corr-1', Date.now(), { test: '1' }),
        new TestEvent('evt-2', 'corr-2', Date.now(), { test: '2' }),
      ];
      eventEmitter.emitAsync.mockResolvedValue(undefined);

      await expect(adapter.publishAll(events)).resolves.toBeUndefined();
    });

    it('should reject if any emission fails', async () => {
      const events = [
        new TestEvent('evt-1', 'corr-1', Date.now(), { test: '1' }),
        new TestEvent('evt-2', 'corr-2', Date.now(), { test: '2' }),
      ];
      eventEmitter.emitAsync
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Partial failure'));

      await expect(adapter.publishAll(events)).rejects.toThrow('Partial failure');
    });
  });
});