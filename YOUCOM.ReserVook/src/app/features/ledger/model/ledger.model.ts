import { StayInfo } from '../../reserve/model/reserve.model';

/**台帳情報 */
export class LedgerInfo implements StayInfo {
  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;
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

  /**利用日 */
  useDate: string;
  /**利用者名 */
  guestName: string;
  /**利用者カナ */
  guestKana: string;
  /**金額 */
  amountPrice: number;
  /**内消費税 */
  insideTaxPrice: number;
  /**内消費税 */
  assignRoomList: string[];
}

/**台帳情報表示用 */
export class LedgerViewInfo {
  reserveNo: string;
  roomName: string;
  guestName: string;
  members: number;
  stayDays: string;
  amountPrice: number;
  insideTaxPrice: number;
}
