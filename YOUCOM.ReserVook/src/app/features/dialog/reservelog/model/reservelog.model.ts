import { Base } from './../../../../shared/model/baseinfo.model';

/** 予約変更履歴情報 */
export class ReserveLogInfo implements Base {
  // Base
  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;

  /** 予約番号 */
  reserveNo: string;
  /** ログSEQ */
  reserveLogSeq: number;
  /** SEQグループ(同時刻に作成のもので採番) */
  seqGroup: number;
  /** 処理区分(1:新規作成,2:更新,3:削除) */
  processDivision: string;
  /** 変更項目 */
  changeItem: string;
  /** 変更前値 */
  beforeValue: string;
  /** 変更後値 */
  afterValue: string;

  /** 変更日 */
  changeDate: string;
  /** 変更時刻 */
  changeTime: string;
  /** 処理区分名 */
  processDivName: string;
}

/** 処理区分 */
export enum processDivision{
  Add = 1,
  Update,
  Delete
}
