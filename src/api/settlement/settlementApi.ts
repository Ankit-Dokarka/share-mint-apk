import { apiRequest } from '../request';
import type { CreateSettlementPayload } from '../../types/settlement';

export const settlementAPI = {
  createSettlement: (payload: CreateSettlementPayload) =>
    apiRequest<void>({
      method: 'POST',
      url: '/api/settlements',
      data: payload,
    }),
};
