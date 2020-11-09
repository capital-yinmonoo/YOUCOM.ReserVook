import { ItemInfo, SetItemInfo } from './../../../item/model/item';

/** セット商品情報(親+子) */
export class SetItem implements ItemInfo {
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
  taxServiceDivision: string;
  taxDivision: string;
  taxrateDivision: string;
  taxrateDivisionName: string;
  serviceDivision: string;
  displayOrder: number;
  itemDivisionName: string;
  mealDivisionName: string;

  /** セット商品(子)リスト */
  childItems: Array<SetItemInfo> = [];
}

/** 商品マスタ(商品区分毎) */
export class ItemInfoEx{
 itemDivision: string;
 itemDivisionName: string;
 itemList: Array<ItemInfo>;
}
