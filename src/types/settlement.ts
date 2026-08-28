export interface CreateSettlementPayload {
  groupId: string;
  receiver: string;
  amount: number;
  note?: string;
}
