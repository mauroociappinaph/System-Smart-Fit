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
): Promise<ListResponse> {
  return api
    .get('/insights', { params: { userId, offset, limit } })
    .then((res) => res.data);
}

export function validate(
  id: string,
  dto: ValidateDTO,
): Promise<InsightDTO> {
  return api.patch(`/insights/${id}/validate`, dto).then((res) => res.data);
}
