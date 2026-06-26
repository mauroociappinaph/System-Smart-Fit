import api from '@/lib/axios';

export type InsightDTO = {
  id: string;
  userId: string;
  category: string;
  content: string;
  score: number;
  validationStatus: string;
  createdAt: number;
  updatedAt: number;
};

export type ListResponse = {
  data: InsightDTO[];
  total: number;
};

export type ValidateDTO = {
  action: 'approve' | 'reject' | 'discard';
};

export function list(
  userId: string,
  offset = 0,
  limit = 10,
  month?: number,
  startDate?: number,
  endDate?: number,
): Promise<ListResponse> {
  const params: Record<string, string | number | undefined> = {
    userId,
    offset,
    limit,
    month,
    startDate,
    endDate,
  };
  // Remove undefined keys so they don't pollute the query string
  Object.keys(params).forEach(
    (k) => params[k] === undefined && delete params[k],
  );
  return api.get('/insights', { params }).then((res) => res.data);
}

export function validate(
  id: string,
  dto: ValidateDTO,
): Promise<InsightDTO> {
  return api.patch(`/insights/${id}/validate`, dto).then((res) => res.data);
}
