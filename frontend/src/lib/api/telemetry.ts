import api from '@/lib/axios';

export type TelemetryDTO = {
  userId: string;
  metricType: string;
  value: number;
  unit: string;
  deviceTimestamp: number;
  correlationId?: string;
};

export function submit(dto: TelemetryDTO): Promise<void> {
  return api.post('/telemetry', dto).then((res) => res.data);
}
