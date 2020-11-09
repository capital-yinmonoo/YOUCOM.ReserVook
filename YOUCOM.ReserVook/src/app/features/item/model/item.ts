import { Base } from '../../../shared/model/baseinfo.model'

//商品情報
export class ItemInfo implements Base {
  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;

  itemDivision: string;
  mealDivision: string;
  itemCode: string;
  itemName: string;
  itemKana: string;
  printName: string;
  unitPrice: number;
  taxServiceDivisionName: string;
  /** 税区分 '0':非課税, '1':税込 */
  taxDivision: string;
  /** 税率区分 '1':標準税率, '2':軽減税率 */
  taxrateDivision: string;
  taxrateDivisionName: string;
  serviceDivision: string;
  displayOrder: number;
  itemDivisionName: string;
  mealDivisionName: string;
}

//税サ区分
export class TaxServiceDivision {
  taxServiceDivision: string;
  displayName: string;
}

export const taxrateDivision: any[]= [{key: '1', value: '標準税率'},{key: '2', value: '軽減税率'}];

/** セット商品マスタ情報 */
export class SetItemInfo implements Base {
  companyNo: string;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;

  seq : number

  setItemCode: string;
  setItemName: string;

  itemDivision: string;
  itemCode: string;
  itemName: string;
  unitPrice: number;

  /** 税率区分 '1':標準税率, '2':軽減税率 */
  taxrateDivision: string;
  taxrateDivisionName: string;
  serviceDivision: string;
  displayOrder: number;
  itemDivisionName: string;

  /** 商品マスタの情報 */
  baseItemInfo: ItemInfo;
}
