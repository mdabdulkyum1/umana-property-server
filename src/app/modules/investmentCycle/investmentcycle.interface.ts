export interface IInvestmentCycleCreate {
  name: string;
  startDate?: Date;
  endDate?: Date;
  isInvested: boolean;

}

export interface IInvestmentCycleUpdate {
  name?: string;
  totalDeposit?: number;
  totalProfit?: number;
  isInvested?: boolean;
  distributed?: boolean;
  endDate?: Date;
}
