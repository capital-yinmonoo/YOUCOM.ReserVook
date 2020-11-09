import { Base } from '../../../../shared/model/baseinfo.model'

export const ReceiptDivs: any[]= [{key: '0', value: '領収金額に含める'},{key: '1', value: '領収金額に含めない'}];

export class DenominationInfo implements Base {
  companyNo: string;
  denominationCode: string;
  denominationName: string;
  printName: string;
  receiptDiv: string;
  displayOrder: number;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;
}










