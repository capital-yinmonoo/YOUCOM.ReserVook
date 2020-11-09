/** 料理日報 検索条件 */
export class DishReportCondition {
  /** 会社番号 */
  companyNo: string;
  /** 利用日(開始) */
  fromUseDate: string;
  /** 利用日(終了) */
  toUseDate: string;
}

/** 料理日報 一覧情報 */
export class DishInfo {
  /** 料理区分 */
  mealDivision: string;
  /** 料理区分名 */
  mealDivisionName: string;
  /** 商品コード */
  itemCode: string;
  /** 料理名 */
  mealName: string;
  /** 合計料理数 */
  sumMealNumber: number;
  /** 料理情報 */
  dishDayInfo: Array<DishDayInfo>;
}

/** 料理日報 日別情報 */
export class DishDayInfo {
  /** 利用日 */
  useDate: string;
  /** 料理数 */
  mealNumber: number;
}

/** 表示カラム用プロパティ */
export interface ColumnProperty {
  name: string;
  width: number;
  prop: string;
}

/** 印刷カラム用プロパティ */
export interface RowInfoProperty {
  value: string;
  prop: string;
}
