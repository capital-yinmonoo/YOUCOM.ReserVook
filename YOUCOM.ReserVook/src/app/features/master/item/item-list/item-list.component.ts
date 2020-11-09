import { Message, DBUpdateResult, ItemDivision, FunctionId, MessagePrefix } from './../../../../core/system.const';
import { ItemInfo } from '../../../item/model/item';
import { User } from '../../../../core/auth/auth.model';
import { Component, OnInit } from '@angular/core';
import { itemService} from '../../../item/services/item.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Common } from 'src/app/core/common';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class itemListComponent implements OnInit {

  private currentUser : User;

  public items: ItemInfo[];

  public readonly ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };
  constructor(private itemService:itemService,private authService:AuthService) {
    this.currentUser = this.authService.getLoginUser();
  }

  ngOnInit(): void {

    // Get Item Master
    let item = new ItemInfo();
    item.companyNo = this.currentUser.displayCompanyNo;
    this.itemService.getItemListView(item).subscribe((res: ItemInfo[]) => {
      this.items = res;

      // Without SetItem
      for(let i = this.items.length - 1; i >= 0; i--) {
        if (this.items[i].itemDivision == ItemDivision.SetItem.toString()){
          this.items.splice(i, 1);
        }
      }

    });

  }

  public checkDelete(itemCode: string): void {

    const item = this.items.find(element => element.itemCode == itemCode);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '商品コード:'+ item.itemCode + Message.DELETE_CONFIRM, null, MessagePrefix.CONFIRM + FunctionId.ITEM_LIST + '001').then((result) =>{

      if(result){
        this.itemService.checkDelete(item).pipe().subscribe(check => {
          // OK
          switch(check){
            case 0:
              this.delete(item);
              break;

            case 1:
              Common.modalMessageConfirm(Message.TITLE_CONFIRM, Message.DELETE_CONFIRM_ADJUSTCANCEL, null, MessagePrefix.CONFIRM + FunctionId.ITEM_LIST + '002').then((checkresult) =>{
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
              Common.modalMessageError(Message.TITLE_ERROR, '商品コード:' + item.itemCode + Message.DELETE_DATA_FAULT_FOR_USED, MessagePrefix.ERROR + FunctionId.ITEM_LIST + '001');
              break;

            case -2:
              // セット商品は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, Message.DELETE_ITEM_SETITEM_ERROR, MessagePrefix.ERROR + FunctionId.ITEM_LIST + '002');
              break;

            case -3:
              // セット商品で使用中は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, "セット商品マスタ" + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.ITEM_LIST + '003');
              break;

            case -4:
              // プラン変換で使用中は削除不可
              Common.modalMessageError(Message.TITLE_ERROR, "プラン変換マスタ" + Message.DELETE_USED_ERROR, MessagePrefix.ERROR + FunctionId.ITEM_LIST + '004');
              break;

            default:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, "商品マスタ" + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ITEM_LIST + '005');
              break;
          }

        });

      } else {
        // cancel
        return;
      }

    });

  }

  private delete(item: ItemInfo) {

    item.updator = this.currentUser.userName;

    this.itemService.deleteItem(item).pipe().subscribe(result => {
      if (result == DBUpdateResult.VersionError) {
        // バージョンError
        Common.modalMessageWarning (Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.ITEM_LIST + '001');
      }
      if (result == DBUpdateResult.Error) {
        // Error
        Common.modalMessageError (Message.TITLE_ERROR, '商品マスタ' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.ITEM_LIST + '006');
      }

      // Reload Item Master
      this.ngOnInit();

    });
  }
}
