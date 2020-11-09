import { DBUpdateResult } from './../../../core/system.const';
import { Base } from '../../../shared/model/baseinfo.model'
import { AssignInfo, GuestInfo } from '../../reserve/model/reserve.model';

/**部屋マスタ */
export class RoomInfo implements Base {
    companyNo:string;
    status: string;
    version :number;
    creator:string;
    updator:string;
    cdt:string;
    udt:string;
    roomNo: string;
    roomName: string;
    floor: string;
    roomTypeCode: string;
    smokingDivision: string;
    remarks: string;
    rowIndex: number;
    columnIndex: number;

    roomTypeName: string;
    floorName: string;
    smokingDivisionName: string;
}

/**検索条件 */
export class RoomsAssignCondition{
  /**会社番号 */
  companyNo: string;
  /**利用日 */
  useDate: string;
  /**CO予定を表示 */
  viewCOFlg: boolean;
}

/**アサイン情報 */
export class RoomsAssignedInfo implements AssignInfo {

  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;
  reserveNo: string;
  useDate: string;
  roomNo: string;
  roomtypeCode: string;
  orgRoomtypeCode: string;
  routeSEQ: number;
  roomtypeSeq : number;
  roomStateClass: string;
  guestName: string;
  memberMale: number;
  memberFemale: number;
  memberChildA: number;
  memberChildB: number;
  memberChildC: number;

  email : string;
  hollowStateClass: string;

  hideHollowStateClass: string;
  hideReserveNo: string;

  cleaningInstruction: string;
  cleaningRemarks: string;
  isStatusUpdateData: boolean;
  roomStatusValue: number;

  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;

  /**画面行インデックス*/
  public rowIndex: number;
  /**画面列インデックス*/
  public columnIndex: number;
  /**部屋名称*/
  public roomName: string;
  /**部屋タイプ名*/
  public roomTypeName: string;
  /**部屋タイプ区分*/
  public roomTypeDivision: string;
  /**禁煙喫煙区分*/
  public smokingDivision: number;
  /**到着日*/
  public arrivalDate: string;
  /**出発日*/
  public departureDate: string;
  /**泊数*/
  public stayDays: number;
  /**大人人数*/
  public memberAdult: number;
  /**子供人数*/
  public memberChild: number;

  /**部屋パネル状態 */
  panel: ElementInfo;
  /**部屋メニューボタン */
  menuButton: Array<ElementInfo>;

  /**チェックイン日 */
  checkInDay: boolean;
  /**チェックアウト日 */
  checkOutDay:boolean;
}

/**未アサイン情報 */
export class NotAssignedInfo implements AssignInfo{

  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;
  reserveNo: string;
  useDate: string;
  roomNo: string;
  roomtypeCode: string;
  orgRoomtypeCode: string;
  roomtypeSeq : number;
  routeSEQ: number;
  roomStateClass: string;
  guestName: string;
  memberMale: number;
  memberFemale: number;
  memberChildA: number;
  memberChildB: number;
  memberChildC: number;

  email: string;
  hollowStateClass: string;

  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;

  /**部屋タイプ名*/
  roomTypeName: string;
  /**禁煙喫煙区分*/
  smokingDivisionName: string;
  /**到着日*/
  arrivalDate: string;
  /**出発日*/
  departureDate: string;
  /**泊数*/
  stayDays: number;
  /**大人人数*/
  memberAdult: number;
  /**小人人数*/
  memberChild: number;
}

/** 部屋割詳細 */
export class RoomDetailsInfo implements AssignInfo{

  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;
  reserveNo: string;
  useDate: string;
  roomNo: string;
  roomtypeCode: string;
  orgRoomtypeCode: string;
  roomtypeSeq : number;
  routeSEQ: number;
  roomStateClass: string;
  guestName: string;
  memberMale: number;
  memberFemale: number;
  memberChildA: number;
  memberChildB: number;
  memberChildC: number;

  email : string;
  hollowStateClass: string;

  // 表示用
  roomtypeName : string;
  memberTotal : number;

  guestNameKana: string;
  zipCode: string;
  address: string
  phone: string;
  cellphone: string;
  companyName: string;

  nameFileInfo : GuestInfo;

  addFlag: boolean;
  updateFlag: boolean;
  deleteFlag: boolean;

}

/** 部屋割詳細 更新用 */
export class UpdateRoomDetails {
  assignList : Array<RoomDetailsInfo>;
  nameFileList : Array<GuestInfo>;
}

/**ルームチェンジ更新結果 */
export class RoomChangeResult{
  /**移動元部屋番号*/
  result: DBUpdateResult;
  /**移動元部屋番号*/
  baseRoomNo: string;
  /**移動先部屋番号*/
  targetRoomNo: string;
  /**相互ルームチェンジ*/
  isMutualChange: string;
}

/**アサイン状態画面 部屋メニューボタン*/
export class ElementInfo{
  /**キー*/
  key: string;
  /**表示ボタン名*/
  text: string;
  /**アイコン*/
  icon: string;
  /**色*/
  color: string;
}
