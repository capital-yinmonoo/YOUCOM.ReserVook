
export class ReserveData {

  companyNo: string;
  creator: string;
  updator: string;

  // 宿泊者情報
  arrivalDate: string;
  stayDays: string;
  departureDate: string;
  reserveDate: string;
  memberMale: string;
  memberFemale: string;
  memberChildA: string;
  memberChildB: string;
  memberChildC: string;

  // エージェント情報
  agentCode: string;
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
}

export class CustomerData {

  companyNo: string;
  creator: string;
  updator: string;

  // 顧客情報
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


export class ResultData {

  resultCode: number;
  rowNo: number;
  itemName: string;
}
