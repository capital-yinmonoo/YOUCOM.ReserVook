import { Base } from './../../../shared/model/baseinfo.model';

/** 会場マスタ */
export class MstFacilityInfo implements Base{
  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;

  /**会場コード */
  facilityCode: string;
  /**会場名 */
  facilityName: string;
  /**表示順 */
  displayOrder: number;
}

/**予約会場 */
export class TrnFacilityInfo implements Base{
  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;

  /**会場コード */
  facilityCode: string;
  /**利用日 */
  useDate: string;
  /**会場SEQ */
  facilitySeq: number;
  /**開始時刻 */
  startTime: string;
  /**終了時刻 */
  endTime: string;
  /**会場人数 */
  facilityMember: number;
  /**会場備考 */
  facilityRemarks: string;
  /**予約番号 */
  reserveNo: string;
  /**利用者名 */
  guestName: string;
  /**元会場コード */
  OrgFacilityCode: string;
}

/**予約会場 テーブル情報 */
export class FacilityTableInfo{

  facilityCode: string;
  facilityName: string;
  displayOrder: number;

  facilityInfo: Array<ColumnInfo> = [];
}

/**予約会場 カラム情報 */
export class ColumnInfo{
  /**時刻 */
  time: string;
  /**背景色(rgbで指定) */
  backgroundcolor: string;
  /**予約会場情報 */
  info: TrnFacilityInfo;
}

/**予約会場 検索条件 */
export class ReserveFacilityCondition {
  /**会社番号 */
  companyNo: string;
  /**利用日 */
  useDate: string;
}

/** 画面Mode */
export enum FormMode{
  /** 表示・ドラッグ */
  ViewDrag,
  /** 編集(追加) */
  EditAdd,
  /** 編集(更新) */
  EditUpdate
}
