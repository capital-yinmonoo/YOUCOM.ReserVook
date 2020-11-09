export class TrustyouCondition {
  companyNo: string;
  useDateFrom: string;
  useDateTo: string;
}

export interface Trustyou {
  seq:number;
  companyNo: string;
  reserveNo: string;
  roomNo: string;
  arrivalDate: string;
  departureDate: string;
  outGuestName: string;
  outEmail: string;
  sendGuestName: string;
  sendEmail: string;
  languageCode: string;
  sendDate: string;
  sendTime: string;
  sendResult: string;
  status: string;
  version: number | null;
  useDate:string
  creator:string
  updator:string
  cdt:string;
  udt:string;

  displayStatus:string
  displayArrivalDate:string
  displayDepartureDate:string
  displaySendResult:string
  sendDateTime:string

  hasTempData:boolean

  processUser:string;
  tCompanyNo:string;
  isChecked:boolean
}

export class TrustyouSendRecvCondition {
  sendDataList: Trustyou[];
  isCanceled:boolean
}

export interface TrustyouLog {

  companyNo: string;
  logSeq: number;
  processDate: string;
  processTime: string;
  processUser: string;
  logMessage: string;
  errorCode: string;

  displayProcessDate: string;
  displayProcessTime: string;
}

export class TrustyouLogCondition {
  companyNo: string;
  processDate: string;
}

export namespace TrustyouListColumn {

  export const DisplayStatus : string = "displayStatus";
  export const DisplayArrivalDate : string = "displayArrivalDate";
  export const DisplayDepartureDate : string = "displayDepartureDate";
  export const ReserveNo : string = "reserveNo";
  export const RoomNo : string = "roomNo";
  export const OutGuestName : string = "outGuestName";
  export const OutEmail : string = "outEmail";
  export const SendGuestName : string = "sendGuestName";
  export const SendEmail : string = "sendEmail";
  export const DisplaySendResult : string = "displaySendResult";
  export const SendDateTime : string = "sendDateTime";

}
