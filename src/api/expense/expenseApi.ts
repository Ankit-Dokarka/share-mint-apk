import { apiRequest } from '../request';
import type {
  GroupExpensesResponse,
  CreateExpensePayload,
  Expense,
} from '../../types/expense';

export const expenseAPI = {
  getGroupExpenses: (groupId: string) =>
    apiRequest<GroupExpensesResponse>({
      method: 'GET',
      url: `/api/groups/${groupId}/expenses`,
    }),

  createExpense: (payload: CreateExpensePayload) =>
    apiRequest<Expense>({
      method: 'POST',
      url: '/api/expenses',
      data: payload,
    }),
};
