import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DetailedSearchService } from '../services/detailedsearch.service';
import { User } from 'src/app/core/auth/auth.model';
import { Common } from 'src/app/core/common';
import { Message } from 'src/app/core/system.const';
import { LostItemListInfo } from '../../lostitemlist/model/lostitemlist.model';
import { CodeNameInfo } from '../../master/codename/model/codename.model';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-detailedsearch-form',
  templateUrl: './detailedsearch-form.component.html',
  styleUrls: ['./detailedsearch-form.component.scss']
})
export class DetailedSearchFormComponent implements AfterViewInit {

  private currentUser : User;

  // ngModel
  public foundPlaceCode: string = "";
  public storageCode: string = "";

  foundPlace:CodeNameInfo[];
  storage:CodeNameInfo[];

  public searchLostitemList : LostItemListInfo[] = Array();

  constructor(private authService:AuthService
              , private detailedSearchService : DetailedSearchService
              , public dialogRef: MatDialogRef<DetailedSearchFormComponent>
              , @Inject(MAT_DIALOG_DATA) public data: LostItemListInfo) {
      this.currentUser = this.authService.getLoginUser();
  }
  ngAfterViewInit(): void {
    throw new Error("Method not implemented.");
  }

  ngOnInit() {
    var hParams = new HttpParams();
    hParams = hParams.append('companyNo', this.currentUser.displayCompanyNo);

    // 忘れ物発見場所分類
    this.detailedSearchService.GetFoundPlaceList(hParams).subscribe((res : CodeNameInfo[]) => {
      this.foundPlace = res;
    });

    // 忘れ物保管分類
    this.detailedSearchService.GetStorageList(hParams).subscribe((res : CodeNameInfo[]) => {
      this.storage = res;
    });
  }

  /** 検索 */
  public Search(){

    // 検索条件
    let cond = new LostItemListInfo();
    cond.companyNo = this.currentUser.displayCompanyNo;
    cond.foundPlaceCode = this.foundPlaceCode;
    cond.storageCode = this.storageCode;
    this.dialogRef.close(cond);
  }

  /** クリア */
  public Clear(){
    this.foundPlaceCode = "";
    this.storageCode = "";
  }

  /** 戻る */
  public CloseDialog() {
    this.dialogRef.close();
  }
}
