import { Base } from '../../../shared/model/baseinfo.model';
import { TrnFacilityInfo } from '../../facility/model/facility.model';

export class Reserve implements Base {

  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

  reserveNo: string;

  stayInfo: StayInfo;
  guestInfo: GuestInfo;
  agentInfo: AgentInfo;
  roomTypeInfo : Array<RoomTypeInfo> = [];
  itemInfo: Array<SalesDetailsInfo> = [];
  depositInfo: Array<DepositInfo> = [];
  remarksInfo: Array<RemarksInfo> = [];

  trnFacilityInfo: Array<TrnFacilityInfo> = [];

  assignList: Array<AssignInfo> = [];

  // チェック用
  adjustmentedBillNoCheckList: Array<number> = [];

  // 更新用
  assignInfo: AssignInfo;

  // 連泊画面から予約作成時 アサイン用 部屋番号
  assignRoomNo : String;

  // 部屋割詳細情報 上書きチェック用
  hasRoomsNameFile : boolean;

  xTravelAgncBkngNum: string;
  scCd: string;
  xTravelAgncBkngSeq: number;
}

export class StayInfo implements Base {

  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

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

  adjustmentFlag: string;
  reserveStateDivision: string;
}

export class AgentInfo{
  agentCode: string;
  agentRemarks: string;
}

export class GuestInfo implements Base{

  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

  reserveNo: string;

  nameSeq: number;

  phone: string;
  cellphone: string;
  guestName: string;
  guestNameKana: string;
  companyName: string;
  email: string;
  zipCode: string;
  address: string
  customerNo: string;

  remarks1:string;
  remarks2:string;
  remarks3:string;
  remarks4:string;
  remarks5:string;

  useDate: string;
  routeSEQ: number;

  overwriteFlag : boolean;
}

export class RoomTypeInfo implements Base{

  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

  reserveNo: string;

  useDate: string;
  roomType: string;
  rooms: number;
  roomtypeSeq: number;

  routeSEQ: number;

  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;
}

export class SalesDetailsInfo implements Base {

  // Base
  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

  reserveNo: string;

  detailsSeq: number;
  itemDivision: string;
  mealDivision: string;
  useDate: string;
  itemCode: string;
  printName: string;
  unitPrice: number;
  itemNumberM: number;
  itemNumberF: number;
  itemNumberC: number;
  amountPrice: number;
  insideTaxPrice: number;
  insideServicePrice: number;
  outsideServicePrice: number;
  dinner: string;
  breakfast: string;
  lunch: string;
  taxDivision: string;
  taxRateDivision: string;
  serviceDivision: string;
  setItemDivision: string;
  setItemSeq: number;
  taxRate: number;
  billSeparateSeq: string;
  billNo: string;
  adjustmentFlag: string;

  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;
}

export class DepositInfo implements Base{

  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

  reserveNo: string;

  detailsSeq: number;
  depositDate: string;
  denominationCode: string;
  printName: string;
  price: number;
  billingRemarks: string;
  billSeparateSeq: string;
  billNo: string;
  adjustmentFlag: string;

  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;
}

export class RemarksInfo implements Base{

  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

  reserveNo: string;

  noteSeq: number;
  remarks: string

  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;
}

export class AssignInfo implements Base{

  companyNo:string;
  status: string;
  version :number;
  creator:string;
  updator:string;
  cdt:string;
  udt:string;

  reserveNo: string;

  useDate : string;
  roomNo : string;
  roomtypeCode : string;
  /**元部屋タイプコード */
  orgRoomtypeCode : string;
  routeSEQ : number;
  roomtypeSeq : number;

  // 部屋状態("Assign", "Stay", "CO","Cleaned")
  roomStateClass : string;
  guestName : string;
  memberMale : number;
  memberFemale : number;
  memberChildA : number;
  memberChildB : number;
  memberChildC : number;

  email : string;
  hollowStateClass: string;

  // 更新用
  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;
}

// 精算時の更新情報
export class AdjustmentUpdateInfo {
  reserve : Reserve;              // 精算前に予約情報を更新する
  adjustment : SalesDetailsInfo;  // 精算
}

export class SalesDetailsTaxInfo {
  insideTaxPrice: number;
  insideServicePrice: number;
  outsideServicePrice: number;
  outsideServiceTaxPrice: number;
}

export class ResultInfo {
  reserveNo: string;
  reserveResult: number;
  assignResult: number;
}


