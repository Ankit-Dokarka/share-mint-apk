import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expenseAPI } from '../api/expense/expenseApi';
import { getFriendlyError } from '../utils/getFriendlyError';
import type { Expense, Balance } from '../types/expense';

interface ExpenseState {
  expenses: Expense[];
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  balances: [],
  isLoading: false,
  error: null,
};

export const fetchGroupDetails = createAsyncThunk(
  'expense/fetchGroupDetails',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getGroupExpenses(groupId);
      return response;
    } catch (error) {
      return rejectWithValue(getFriendlyError(error));
    }
  },
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGroupDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.expenses;
        state.balances = action.payload.balances;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default expenseSlice.reducer;
