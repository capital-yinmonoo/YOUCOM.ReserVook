import { Message, DBUpdateResult, MessagePrefix, FunctionId } from './../../../core/system.const';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User, EnumRole } from '../../../core/auth/auth.model';
import { LostItemListInfo} from '../model/lostitemlist.model';
import { LostItemListService } from '../services/lostitemlist.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Common } from 'src/app/core/common';
import { CompanyInfo } from '../../company/model/company.model';
import { FormGroup, FormControl } from '@angular/forms';
import { DetailedSearchFormComponent } from '../../detailedsearch/detailedsearch-form/detailedsearch-form.component';
import { MatDialog } from '@angular/material';
import { LumpDeleteFormComponent } from '../../lumpdelete/lumpdelete-form/lumpdelete-form.component';
import { SharedService } from '../../../core/shared.service';

@Component({
  selector: 'app-lostitemslist-list',
  templateUrl: './lostitemlist-list.component.html',
  styleUrls: ['./lostitemlist-list.component.scss']
})
export class LostItemListListComponent implements OnInit {

  currentUser : User;
  company: CompanyInfo;
  lostItemLists: LostItemListInfo[];
  useCapacity: number = 0;
  dispUseCapacity: string;
  dispMaxCapacity: string;

  limitCapacity: number;
  role = EnumRole;
  searchWord: string;
  overFlg:boolean;

  kb = 1024;
  mb = Math.pow(this.kb, 2);
  gb = Math.pow(this.kb, 3);

  @ViewChild('fileInput', {static: false})
  public fileInput;
  public file: File = null;
  public imageSrc: string | ArrayBuffer;

  lostItemListForm = new FormGroup({
    companyNo: new FormControl(''),
    managementNo: new FormControl(''),
    itemState: new FormControl(''),
    itemCategory: new FormControl(''),
    itemName: new FormControl(''),
    foundDate: new FormControl(''),
    foundTime: new FormControl(''),
    foundPlace: new FormControl(''),
    comment: new FormControl(''),
    searchWord: new FormControl(''),
    foundPlaceCode: new FormControl(''),
    storageCode: new FormControl(''),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });

  constructor(private route: ActivatedRoute
            , private lostItemListService: LostItemListService
            , private authService:AuthService
            , public dialog: MatDialog
            , private SharedService: SharedService) {

      this.currentUser = this.authService.getLoginUser();
      this.company = this.currentUser.companyInfo;
  }

  ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  ngOnInit() : void{
    var lostItemList = new LostItemListInfo();
    lostItemList.companyNo = this.currentUser.displayCompanyNo;

    // 最大保存容量 計算
    if (this.company.maxCapacity >= this.gb) {
      this.dispMaxCapacity = (Math.floor((this.company.maxCapacity / this.gb) * 100) / 100).toString() + " GB";
    } else if (this.company.maxCapacity >= this.mb) {
      this.dispMaxCapacity = (Math.floor((this.company.maxCapacity / this.mb) * 100) / 100).toString() + " MB";
    } else if (this.company.maxCapacity >= this.kb) {
      this.dispMaxCapacity = (Math.floor((this.company.maxCapacity / this.kb) * 100) / 100).toString() + " KB";
    }else{
      this.dispMaxCapacity = this.company.maxCapacity.toString() + " Byte";
    }

    // 一覧情報読込
    this.lostItemListService.GetLostItemListList(lostItemList).subscribe((res: LostItemListInfo[]) => {
      this.lostItemLists = res;
      this.lostItemLists.forEach((value) => {
        value.imageSrc = "data:" + value.imageContentType + ";base64," + value.imageData;
      });

      // 画像容量現在使用量取得
      this.lostItemListService.GetUsingCapacity(lostItemList).subscribe((res: number) => {
        this.useCapacity = res;

        if (this.useCapacity >= this.gb) {
          this.dispUseCapacity = (Math.floor((this.useCapacity / this.gb) * 100) / 100).toString() + " GB";
        } else if (this.useCapacity >= this.mb) {
          this.dispUseCapacity = (Math.floor((this.useCapacity / this.mb) * 100) / 100).toString() + " MB";
        } else if (this.useCapacity >= this.kb) {
          this.dispUseCapacity = (Math.floor((this.useCapacity / this.kb) * 100) / 100).toString() + " KB";
        }else{
          this.dispUseCapacity = this.useCapacity.toString() + " Byte";
        }

        // 一括削除-削除・忘れ物登録-登録した場合のみ、再チェック
        if(this.SharedService.lostItemDataChanged){
          if(this.useCapacity > this.company.maxCapacity){
            // 容量が最大値を超えた場合警告メッセージ
            Common.modalMessageError(Message.TITLE_ERROR, "写真の容量合計が最大容量を超えています。", MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_LIST + '001');
            this.overFlg = true;
          }else if(this.useCapacity > this.company.maxCapacity * 0.8){
            // 容量が8割を超えた場合エラーメッセージ
            Common.modalMessageWarning(Message.TITLE_NOTICE, "写真の容量合計が最大容量の8割を超えています。", MessagePrefix.WARNING + FunctionId.LOSTITEMLIST_LIST + '001');
          }
          this.SharedService.lostItemDataChanged = true;
        }
      });
    });
  }

  // 簡易検索
  simpleSearch(){
    var cond = new LostItemListInfo;
    cond.companyNo = this.currentUser.displayCompanyNo;
    if(this.searchWord == null){
      cond.searchWord = "";
    }else{
      cond.searchWord = this.searchWord;
    }

    this.lostItemListService.GetLostItemListList(cond).subscribe((res: LostItemListInfo[]) => {
      this.lostItemLists = res;
      this.lostItemLists.forEach((value) => {
        value.imageSrc = "data:" + value.imageContentType + ";base64," + value.imageData;
      });
    });
  }

  /** 詳細検索画面を起動 */
  public detailedSearch(){

    let dialogRef = this.dialog.open(DetailedSearchFormComponent
      , { width: '70vw', height: 'auto'});

    // 戻り値があれば詳細検索
    dialogRef.afterClosed().subscribe(result => {
      if(!Common.IsNullOrEmpty(result)){
        var condSearch = new LostItemListInfo;
        condSearch.companyNo = this.currentUser.displayCompanyNo;
        condSearch.foundPlaceCode = result.foundPlaceCode;
        condSearch.storageCode = result.storageCode;
        this.lostItemListService.GetLostItemListList(condSearch).subscribe((res: LostItemListInfo[]) => {
          this.lostItemLists = res;
          this.lostItemLists.forEach((value) => {
            value.imageSrc = "data:" + value.imageContentType + ";base64," + value.imageData;
          });
        });
      }
    });
  }

  /** 一括削除画面を起動 */
  public lumpDelete(){

    let dialogRef = this.dialog.open(LumpDeleteFormComponent
      , { width: '70vw', height: 'auto'});

    dialogRef.afterClosed().subscribe(result =>{
      this.ngOnInit();
    });
  }

  // 削除
  delete(managementNo: string): void {
    var delData = new LostItemListInfo();
    var companyNo = this.currentUser.displayCompanyNo;
    delData = this.lostItemLists.find(element => element.companyNo == companyNo && element.managementNo == managementNo);

    Common.modalMessageConfirm(Message.TITLE_CONFIRM, '管理番号:'+ delData.managementNo + Message.DELETE_CONFIRM,null, MessagePrefix.CONFIRM + FunctionId.LOSTITEMLIST_LIST + '001').then((result) =>{
      if (result) {
        // OK

        this.lostItemListService.DeleteLostItem(delData).pipe().subscribe(result => {
          switch(result){
            case DBUpdateResult.Error:
              // Error
              Common.modalMessageError(Message.TITLE_ERROR, '忘れ物一覧' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_LIST + '002');
              break;
          }
          this.ngOnInit();
        });
      } else {
        // Cancel
        return;
      }
    });
  }
}
