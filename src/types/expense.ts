export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  paidBy: User;
  expenseDate: string;
}

export interface Balance {
  user: User;
  balance: number;
}

export interface GroupExpensesResponse {
  expenses: Expense[];
  balances: Balance[];
}
