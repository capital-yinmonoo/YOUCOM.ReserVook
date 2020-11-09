import { Base } from '../../../../shared/model/baseinfo.model'

export class CustomerInfo implements Base {
  companyNo: string;
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
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;
}

/** 顧客登録結果クラス
 * @customerNo 新規採番した顧客登番号
 * @resultCode 0(成功) or 1(エラー)
 */
export class CustomerRegInfo {
  customerNo : string;
  resultCode : number;
}
