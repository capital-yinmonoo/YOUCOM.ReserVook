export class ReserveDataCondition{
  companyNo: string;
  arrivalDateFrom: string;
  arrivalDateTo: string;
  departureDateFrom: string;
  departureDateTo: string;
}

export class ReserveData {
  // 宿泊者情報
  reserveNo: string;
  arrivalDate: string;
  stayDays: number;
  departureDate: string;
  reserveDate: string;
  memberMale: number;
  memberFemale: number;
  memberChildA: number;
  memberChildB: number;
  memberChildC: number;

  // エージェント情報
  agentCode: string;
  agentName: string;
  agentRemarks: string;

  // 利用者情報
  phoneNo: string;
  mobilePhoneNo: string;
  guestName: string;
  guestKana: string;
  companyName: string;
  zipCode: string;
  email: string;
  address: string
  customerNo: string;

  // 商品情報の合計金額
  useAmountTotal : number;
}

export class CustomerDataCondition{
  companyNo: string;
  guestKana: string;
  phoneNo: string;
  useDateFrom: string;
  useDateTo: string;
  useAmountMin: string;
  useAmountMax: string;
}

export class CustomerData {

  // 顧客情報
  customerNo: string;
  customerName: string;
  customerKana: string;
  zipCode: string;
  address: string;
  phoneNo: string;
  mobilePhoneNo: string;
  email: string;
  companyName: string;
  remarks1: string;
  remarks2: string;
  remarks3: string;
  remarks4: string;
  remarks5: string;
}
