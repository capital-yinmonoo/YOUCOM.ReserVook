import { SetItemService } from './../services/setitem.service';
import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../../core/system.const';
import { ItemInfo, TaxServiceDivision, taxrateDivision } from '../../../item/model/item';
import { User } from '../../../../core/auth/auth.model';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Common } from 'src/app/core/common';
import { Base } from 'src/app/shared/model/baseinfo.model';
import { itemService } from 'src/app/features/item/services/item.service';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { SetItem } from '../model/setitem.model';
import { TaxRateInfo } from '../../taxrate/model/taxrateinfo.model';
import { ReserveService } from 'src/app/features/reserve/services/reserve.service';

@Component({
  selector: 'app-setitem-list',
  templateUrl: './setitem-list.component.html',
  styleUrls: ['./setitem-list.component.scss']
})
export class SetItemListComponent implements OnInit {

  /** ログインユーザー */
  private currentUser : User;

  /** 商品情報リスト */
  public items: SetItem[];

  /** 税サ区分 */
  public M_TaxServiceDivision: Array<TaxServiceDivision> = [];

  /** 税率区分 */
  public taxrateDivision = taxrateDivision;

  public ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  constructor(private authService: AuthService,
              private setItemService: SetItemService,
              private itemService: itemService,
              private reserveService: ReserveService) {

    this.currentUser = this.authService.getLoginUser();

  }

  public ngOnInit(): void {
    let cond = new Base();
    cond.companyNo = this.currentUser.displayCompanyNo;

    this.setItemService.getSetItemParentList(cond).subscribe((res: SetItem[]) => {
      this.items = res;

      // 税サ区分補完
      this.items.forEach(x => x.taxServiceDivision = x.taxDivision + x.serviceDivision);
    });

    // TaxService Division
    this.itemService.getTaxServiceListView(cond).subscribe((res: TaxServiceDivision[]) => {
      this.M_TaxServiceDivision = res;
    });

  }

  /** 削除クリック */
  public onDelete(itemCode: string) {

    const item = this.items.find(f => f.itemCode == itemCode);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, "セット商品コード:" + itemCode + "<br>" + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.SETITEM_LIST + '001').then((result) =>{

      if(result){
        this.setItemService.checkBeforeDelete(item).pipe().subscribe(check => {
          // OK
          switch(check){
            case 0:
              this.delete(item);
              break;

            case 1:
              Common.modalMessageConfirm(Message.TITLE_CONFIRM, Message.DELETE_CONFIRM_ADJUSTCANCEL, null, MessagePrefix.CONFIRM + FunctionId.SETITEM_LIST + '002').then((checkresult) =>{
                if(!checkresult){
                  // Cancel
                  return;
                }else{
                  // OK
                  this.delete(item);
                }
              });
              break;

            case -1:
              // 使用済/予定は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, "セット商品コード:" + itemCode + Message.DELETE_DATA_FAULT_FOR_USED, MessagePrefix.ERROR + FunctionId.SETITEM_LIST + '001');
              break;

            case -4:
              // プラン変換で使用中は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, "プラン変換マスタ" + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.SETITEM_LIST + '002');
              break;

            default:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, "商品マスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.SETITEM_LIST + '003');
              break;

          }

        });

      } else {
        // cancel
        return;
      }

    });

  }

　/** 削除 */
  private delete(item: ItemInfo) {

    // 条件セット
    item.updator = this.currentUser.userName;

    this.setItemService.deleteSetItem(item).pipe().subscribe(result => {

      if (result == DBUpdateResult.VersionError) {
        // バージョンError
        Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.SETITEM_LIST + '001');
      }
      if (result == DBUpdateResult.Error) {
        // Error
        Common.modalMessageError (Message.TITLE_ERROR, 'セット商品マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.SETITEM_LIST + '004');
      }

      // data reload
      this.ngOnInit();

    });

  }

    /** 税サ区分 名称変換
   * @param  {} value
   */
  public DispTaxServiceDivName(value) : string {

    let result = '';
    if(Common.IsNullOrEmpty(value)) return result;
    result = this.M_TaxServiceDivision.find(x => x.taxServiceDivision == value).displayName;

    return result;
  }

  /** 税率区分 名称変換
   * @param  {} value
   */
  public DispTaxRateDivName(value) : string {

    let result = '';
    if(Common.IsNullOrEmpty(value)) return result;
    result = this.taxrateDivision.find(x => x.key == value).value;

    return result;
  }
}
