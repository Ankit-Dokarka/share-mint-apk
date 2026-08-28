import { apiRequest } from '../request';
import type { GroupExpensesResponse } from '../../types/expense';

export const expenseAPI = {
  getGroupExpenses: (groupId: string) =>
    apiRequest<GroupExpensesResponse>({
      method: 'GET',
      url: `/api/groups/${groupId}/expenses`,
    }),
};
