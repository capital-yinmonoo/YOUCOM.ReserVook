import { ItemInfo, TaxServiceDivision, SetItemInfo } from '../../item/model/item';
import { TaxRateInfo } from '../../master/taxrate/model/taxrateinfo.model';
import { CodeNameInfo } from '../../master/codename/model/codename.model';

/** 売上明細まわりで使用するマスタ類まとめ
 * パラメータの受け渡しのためにひとまとめにする。
*/
export class MasterInfo {

  public M_StayItemList : ItemInfo[];
  public M_OtherItemList : ItemInfo[];
  public M_SetItemList : ItemInfo[];            // 親
  public M_SetItemDetailsList : SetItemInfo[];  // 子
  public M_MealDivision : CodeNameInfo[];
  public M_TaxServiceDivisionList : TaxServiceDivision[];
  public M_TaxRateList : TaxRateInfo[];
  public M_ServiceRate : number;
}

