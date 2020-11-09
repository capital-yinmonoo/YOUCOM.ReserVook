export class ConfirmIncome {
  reserveno: string;
  guestname: string;
  staydays: string;
  daybeforesales: number;
  todaysales: number;
  daybeforedeposit: number;
  denominationcode: string;
  denominationname: string;
  amountprice: number;
  balance: number;
  totalflag: boolean;
}

export class IncomeQuery {
  companyCode: string;
  queryDate: string;
}
