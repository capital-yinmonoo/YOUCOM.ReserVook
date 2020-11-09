import { DBUpdateResult,  FunctionId,  Message, MessagePrefix} from './../../../core/system.const';
import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LostItemListService } from '../../lostitemlist/services/lostitemlist.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/auth/auth.model';
import { LostItemListInfo, LostItemPictureInfo } from '../../lostitemlist/model/lostitemlist.model';
import { Common } from 'src/app/core/common';
import { LostStateInfo } from '../../master/loststate/model/loststate.model';
import { CodeNameInfo } from '../../master/codename/model/codename.model';
import { RoomInfo } from '../../rooms/model/rooms.model';
import { HttpParams } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';
import { DatePipe } from '@angular/common';
import { ReserveCommon } from '../../reserve/reserve-form/reserve.common';
import { CompanyInfo } from '../../company/model/company.model';
import { SharedService } from '../../../core/shared.service';
import { HeaderService } from 'src/app/core/layout/header/header.service';

@Component({
  selector: 'app-lostitemregist-form',
  templateUrl: './lostitemlist-form.component.html',
  styleUrls: ['../../../shared/shared.style.scss', './lostitemlist-form.component.scss'],
  providers: [DatePipe]
})
export class LostItemListFormComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput', {static: false})
  public fileInput;
  public file: File = null;
  public imageSrc: string | ArrayBuffer;
  private navUrl: string = "../../list/";

  public readonly imageHeader: string[] = ['addImage', 'imageSrc', 'fileSeq' ];

  /** 最大サイズ数(MB指定) */
  private readonly MAX_FILE_SIZE: number = 3;

  //#region ---- Form Controls ----
  // Validation
  public readonly positiveNumberFormatPattern = '^[0-9]*$';
  public readonly maxLengthReserveNo = 8;
  public readonly maxLengthRoomNo = 4;
  public readonly maxLengthItemName = 50;
  public readonly maxLengthSearchWord = 100;
  public readonly maxLengthFoundPlace = 255;
  public readonly maxLengthComment = 255;

  // Validation Message
  /** 必須項目です。 */
  public readonly msgRequid = Message.REQUIRED;
  /** 半角数字で入力してください。 */
  public readonly msgNumber = Message.PATTERN_NUMBER;
  /** 50文字以下で入力してください。 */
  public readonly msgMaxLengthItemName = this.maxLengthItemName.toString() + Message.MAX_LENGTH;
  /** 8文字以下で入力してください。 */
  public readonly msgMaxLengthReserveNo = this.maxLengthReserveNo.toString() + Message.MAX_LENGTH;
  /** 4文字以下で入力してください。 */
  public readonly msgMaxLengthRoomNo = this.maxLengthRoomNo.toString() + Message.MAX_LENGTH;
  /** 100文字以下で入力してください。 */
  public readonly msgMaxSearchWord = this.maxLengthSearchWord.toString() + Message.MAX_LENGTH;
  /** 255文字以下で入力してください。 */
  public readonly msgMaxLengthFoundPlace = this.maxLengthFoundPlace.toString() + Message.MAX_LENGTH;
  /** 255文字以下で入力してください。 */
  public readonly msgMaxLengthComment = this.maxLengthComment.toString() + Message.MAX_LENGTH;

  public lostItemListForm = new FormGroup({
    companyNo: new FormControl(''),
    managementNo: new FormControl(''),
    itemState: new FormControl('',[Validators.required]),
    itemCategory: new FormControl(''),
    itemName: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthItemName)]),
    reserveNo: new FormControl('', [Validators.maxLength(this.maxLengthReserveNo), Validators.pattern(this.positiveNumberFormatPattern)]),
    roomNo: new FormControl(''),
    foundDate: new FormControl('',[Validators.required]),
    foundTime: new FormControl('',[Validators.required]),
    foundPlace: new FormControl('',[Validators.required, Validators.maxLength(this.maxLengthFoundPlace)]),
    comment: new FormControl('', [Validators.maxLength(this.maxLengthComment)]),
    searchWord: new FormControl('',[Validators.maxLength(this.maxLengthSearchWord)]),
    foundPlaceCode: new FormControl('',[Validators.required]),
    storageCode: new FormControl('',[Validators.required]),
    status: new FormControl(''),
    version: new FormControl(''),
    creator: new FormControl(''),
    updator: new FormControl(''),
    cdt: new FormControl(''),
    udt: new FormControl(''),
  });
  //#endregion

  Current_user: User;
  companyNo: string;
  managementNo: string;
  updateFlg: boolean;
  overFlg: boolean;
  now: Date;
  lostItemLists: LostItemListInfo[];
  lostItemImages: LostItemPictureInfo[];
  states: LostStateInfo[];
  foundPlace: CodeNameInfo[];
  storage: CodeNameInfo[];
  rooms: RoomInfo[];
  foundtime: string;
  useCapacity: number;
  company: CompanyInfo;

  public lostItemPictureForm = this.setInitFormInfo();

  private imageSEQ: number = 1;
  private maxImageSeq: number = 0;

  public imageSource = new MatTableDataSource<any>();
  private imageList = [];

  private selectedIndex : number;

  constructor(private route: ActivatedRoute
             , private authService: AuthService
             , private router: Router
             , private lostItemListService: LostItemListService
             , private datePipe: DatePipe
             , private fb: FormBuilder
             , private changeDetectorRefs: ChangeDetectorRef
             , private SharedService: SharedService
             , private header: HeaderService) {

    // 取得したURLパラメータを渡す
    this.managementNo = this.route.snapshot.paramMap.get('managementNo');
    this.Current_user = this.authService.getLoginUser();
    this.company = this.Current_user.companyInfo;
  }

  ngOnDestroy(): void {
    this.header.unlockCompanySelecter();
  }

  ngOnInit() {

    this.maxImageSeq = 0;
    var condition = new LostItemListInfo();
    condition.companyNo = this.Current_user.displayCompanyNo;
    this.imageList = [];
    // 画像登録枠初期化
    this.imageSource = new MatTableDataSource([this.lostItemPictureForm]);

    this.getRelatedMaster(condition);

    // 更新
    if (!Common.IsNullOrEmpty(this.managementNo)) {
      this.updateFlg = true;
      this.header.lockCompanySeleter();

      condition.managementNo = this.managementNo;

      // データ取得
      this.lostItemListService.GetLostItemListById(condition).pipe().subscribe(lostItemList =>{
        lostItemList.foundTime = lostItemList.foundTime.substr(0,2) + ":" + lostItemList.foundTime.substr(2,2);
        this.lostItemListForm.patchValue(lostItemList);

        // 画像取得
        this.lostItemListService.GetLostItemImage(condition).pipe().subscribe((imageList: LostItemPictureInfo[]) =>{
          // バイナリデータと型から画像のURLを作成
          imageList.forEach((imageList) => {
            imageList.imageSrc = "data:" + imageList.contentType + ";base64," + imageList.binaryData;
          });
          this.lostItemImages = imageList;

          this.setImageInfo(imageList)

          this.maxImageSeq = imageList.length + 1;

        });

      });

    } else {
      // 登録
      this.updateFlg = false;
      this.now = new Date();

      let lostItemListInfo = new LostItemListInfo();
      lostItemListInfo.foundDate = this.datePipe.transform(this.now,'yyyyMMdd');
      lostItemListInfo.foundTime = this.datePipe.transform(this.now,'HHmm');
      lostItemListInfo.foundTime = lostItemListInfo.foundTime.substr(0,2) + ":" + lostItemListInfo.foundTime.substr(2,2);
      this.lostItemListForm.patchValue(lostItemListInfo);

      this.setImageInfo(this.imageList);
    }

  }

  /** 関連マスタ取得 */
  private getRelatedMaster(condition: LostItemListInfo) {
    var hParams = new HttpParams();
    hParams = hParams.append('companyNo', this.Current_user.displayCompanyNo);

    // 忘れ物状態
    this.lostItemListService.GetStateList(hParams).subscribe((res: LostStateInfo[]) => {
      this.states = res;

      // 新規登録時、登録初期値設定ONの状態を初期セット
      if (!this.updateFlg) {
        const idx = this.states.findIndex(f => f.defaultFlagEntry == "1");
        if (idx > -1){ this.lostItemListForm.patchValue({itemState: this.states[idx].itemStateCode}); }
      }

    });

    // 忘れ物発見場所分類
    this.lostItemListService.GetFoundPlaceList(hParams).subscribe((res: CodeNameInfo[]) => {
      this.foundPlace = res;
    });

    // 忘れ物保管分類
    this.lostItemListService.GetStorageList(hParams).subscribe((res: CodeNameInfo[]) => {
      this.storage = res;
    });

    // 部屋
    this.lostItemListService.GetRoomList(hParams).subscribe((res: RoomInfo[]) => {
      this.rooms = res;
    });

    // 画像容量現在使用量取得
    this.lostItemListService.GetUsingCapacity(condition).subscribe((res: number) => {
      this.useCapacity = res;

      if (this.useCapacity > this.company.maxCapacity) {
        // 容量が最大値を超えた場合警告メッセージ
        this.overFlg = true;
      }
    });
  }

  // 追加・更新処理
  public onSubmit() {

    let lostItemListInfo = new LostItemListInfo();
    lostItemListInfo = this.lostItemListForm.value;
    lostItemListInfo.foundTime = lostItemListInfo.foundTime.substr(0,2) + lostItemListInfo.foundTime.substr(3,2);
    lostItemListInfo.updator = this.Current_user.userName;

    // 画像送信用のリストを作成
    var fSeq: number = 1;
    var list = new Array<LostItemPictureInfo>();
    this.imageList.forEach((imageInfo) => {
      var pictureInfo = new LostItemPictureInfo;
      pictureInfo.companyNo = this.Current_user.displayCompanyNo;
      pictureInfo.managementNo = imageInfo.value.managementNo;
      pictureInfo.fileSeq = fSeq;
      pictureInfo.contentType = imageInfo.value.contentType;
      pictureInfo.binaryData = imageInfo.value.binaryData;
      pictureInfo.creator = this.Current_user.userName;
      pictureInfo.updator = this.Current_user.userName;
      list.push(pictureInfo);
      fSeq++;
    });

    // 容量オーバーかどうかをチェック
    this.lostItemListService.isOverMaxCapacity(list).pipe().subscribe(result => {
      if (result == 0) {
        // 容量が最大値を超えた場合エラー
        Common.modalMessageError(Message.TITLE_ERROR, "写真の容量合計が最大容量を超えているため登録できません。", MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_FORM + '001');
        return;
      } else {
        if (!Common.IsNullOrEmpty(this.managementNo)) {
          // 更新
          this.lostItemListService.updateLostItem(lostItemListInfo).pipe().subscribe(result => {
            switch(result){
              // 正常
              case DBUpdateResult.Success:
                this.sendImage(list);
                break;
              // バージョンエラー
              case DBUpdateResult.VersionError:
                this.SharedService.lostItemDataChanged = false;
                Common.modalMessageWarning(Message.TITLE_VERSION_ERROR, Message.UPDATE_VERSION_ERROR, MessagePrefix.WARNING + FunctionId.LOSTITEMLIST_FORM + '001');
                this.router.navigate([this.navUrl], { relativeTo: this.route });
                break;
              // エラー
              case DBUpdateResult.Error:
                this.SharedService.lostItemDataChanged = false;
                Common.modalMessageError(Message.TITLE_ERROR, '忘れ物登録' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_FORM + '002');
                this.router.navigate([this.navUrl], { relativeTo: this.route });
                break;
            }
          });

        } else {
          // 追加
          lostItemListInfo.companyNo = this.Current_user.displayCompanyNo;
          lostItemListInfo.creator = this.Current_user.userName;
          lostItemListInfo.updator = this.Current_user.userName;
          lostItemListInfo.version = 0; //nullだと400エラーになるのでここでセット

          this.lostItemListService.addLostItem(lostItemListInfo).pipe().subscribe(result => {
            switch(result) {
              // 正常
              case DBUpdateResult.Success:
                this.sendImage(list);
                break;
              // エラー
              default:
                this.SharedService.lostItemDataChanged = false;
                Common.modalMessageError(Message.TITLE_ERROR, '忘れ物登録' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_FORM + '003');
                break;
            }
          });
        }
      }
    });
  }

  // 中止
  public cancel() {
    this.SharedService.lostItemDataChanged = false;
    this.router.navigate([this.navUrl], { relativeTo: this.route });
  }

  /** FormGroup 初期値セット */
  private setInitFormInfo(){
    var result : FormGroup;
    result = this.setImageInfoForm('','', ReserveCommon.SeqPrefix + this.imageSEQ);
    this.imageSEQ++;
    return result;
  }

  /** FormGroup イメージ画像情報 セット */
  private setImageInfoForm(companyNo: string
                          ,managementNo: string
                          ,fileSeq: string
                          ,contentType: string = ''
                          ,binaryData: Uint8Array = null
                          ,imageSrc: string | ArrayBuffer = null){
    return this.fb.group({
        companyNo: new FormControl(companyNo)
      , managementNo: new FormControl(managementNo)
      , fileSeq: new FormControl(fileSeq)
      , contentType: new FormControl(contentType)
      , binaryData: new FormControl(binaryData)
      , imageSrc: new FormControl(imageSrc)
    });
  }

  /** FormGroup イメージ画像情報 セット準備 */
  private setImageInfo(result: any[]){

    this.imageList = [];

    var imageInfo = result;
    // イメージ画像情報
    imageInfo.forEach((images) => {
      this.lostItemPictureForm = this.setImageInfoForm(
          images.companyNo
          , images.managementNo
          , images.fileSeq.toString()
          , images.contentType
          , images.binaryData
          , images.imageSrc
        );
      this.imageList.push(this.lostItemPictureForm);
    });

    if(this.imageList.length==0){
      this.imageList.push(this.lostItemPictureForm);
    }
    this.imageSource.data = this.imageList;

    // maxImageSeq
    this.imageList.forEach(x => {
      if(x.seq > this.maxImageSeq) this.maxImageSeq = x.seq;
    });
  }

  /** 行追加 イメージ画像 */
  public addImageInfo() {
    this.imageList = this.imageSource.data;
    var imageInfoForm = this.setInitFormInfo();
    this.imageList.push(imageInfoForm);
    this.imageSource.data = this.imageList;
  }

  /** 行削除 イメージ画像 */
  public removeImageInfo(fileSeq: string) {
    var wkList = [];
    this.imageList = this.imageSource.data;
    for (var i = 0, len = this.imageSource.data.length; i < len; i++) {
      if (this.imageList[i].value.fileSeq != fileSeq) {
        wkList.push(this.imageList[i]);
      }
    }
    this.imageList = wkList;
    this.imageSource.data = this.imageList;
  }

  /**ファイル選択ボタンクリックイベント */
  public onClickFileSelectButton(idx:number) {
    this.selectedIndex = idx;
    this.fileInput.nativeElement.click();
  }

  /**選択ファイル変更イベント */
  public onChangeFileInput(event:any) {

    this.file = <File>event.target.files[0];

    // Check File Size
    if (this.file.size > this.MAX_FILE_SIZE * 1024 * 1024){
      Common.modalMessageError(Message.TITLE_ERROR, `${this.MAX_FILE_SIZE}MBを超える写真は添付できません。`, MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_FORM + '004');
      return;
    }

    // Show preview
    const mimeType = this.file.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var imageForm;
    let reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = (e) => {

      var index = reader.result.toString().indexOf("base64,");
      let binaryData: any = reader.result.toString().substring(index + 7);

      imageForm = this.setImageInfoForm(
          this.companyNo
        , this.managementNo
        , this.imageList[this.selectedIndex].value.fileSeq.toString()
        , mimeType
        , binaryData
        , reader.result
      );

      // 最大容量チェック
      var fSeq: number = 1;
      var list = new Array<LostItemPictureInfo>();
      this.imageList.forEach((imageInfo) => {
        var pictureInfo = new LostItemPictureInfo;
        pictureInfo.companyNo = this.Current_user.displayCompanyNo;
        pictureInfo.managementNo = imageInfo.value.managementNo;
        pictureInfo.fileSeq = fSeq;
        pictureInfo.contentType = imageInfo.value.contentType;
        pictureInfo.binaryData = imageInfo.value.binaryData;
        pictureInfo.creator = this.Current_user.userName;
        pictureInfo.updator = this.Current_user.userName;
        list.push(pictureInfo);
        fSeq++;
      });

      var pictureInfo2 = new LostItemPictureInfo;
      pictureInfo2.companyNo = this.Current_user.displayCompanyNo;
      pictureInfo2.managementNo = imageForm.value.managementNo;
      pictureInfo2.fileSeq = fSeq;
      pictureInfo2.contentType = imageForm.value.contentType;
      pictureInfo2.binaryData = imageForm.value.binaryData;
      pictureInfo2.creator = this.Current_user.userName;
      pictureInfo2.updator = this.Current_user.userName;
      list.push(pictureInfo2);

      // 容量オーバーかどうかをチェック
      this.lostItemListService.isOverMaxCapacity(list).pipe().subscribe(result => {
        if (result == 0) {
          // 容量が最大値を超えた場合エラー
          Common.modalMessageError(Message.TITLE_ERROR, "写真の容量合計が最大容量を超えているため登録できません。", MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_FORM + '005');

          var imageForm2;

          imageForm2 = this.setImageInfoForm(
            this.companyNo
            , this.managementNo
            , this.imageList[this.selectedIndex].value.fileSeq.toString()
            , ''
            , null
            , ''
          );

          this.imageList[this.selectedIndex] = imageForm2;
          this.imageSource.data = this.imageList;
          this.changeDetectorRefs.detectChanges();
          return;
        } else if(result == 1){
          // 容量が8割を超えた場合、通知メッセージ
          Common.modalMessageWarning(Message.TITLE_NOTICE, "写真の容量合計が最大容量の8割を超えています。", MessagePrefix.WARNING + FunctionId.LOSTITEMLIST_FORM + '002');

          this.imageList[this.selectedIndex] = imageForm;
          this.imageSource.data = this.imageList;
          this.changeDetectorRefs.detectChanges();

          // maxImageSeq
          this.imageList.forEach(x => {
            if(x.seq > this.maxImageSeq) this.maxImageSeq = x.seq;
          });
        } else {
          this.imageList[this.selectedIndex] = imageForm;
          this.imageSource.data = this.imageList;
          this.changeDetectorRefs.detectChanges();

          // maxImageSeq
          this.imageList.forEach(x => {
            if(x.seq > this.maxImageSeq) this.maxImageSeq = x.seq;
          });
        }
      });
    }
  }


  /**選択ファイル削除イベント */
  public onClickFileDeleteButton(idx: number){
    this.selectedIndex = idx;

    var imageForm;

    imageForm = this.setImageInfoForm(
      this.companyNo
      , this.managementNo
      , this.imageList[this.selectedIndex].value.fileSeq.toString()
      , ''
      , null
      , ''
    );

    this.imageList[this.selectedIndex] = imageForm;
    this.imageSource.data = this.imageList;
    this.changeDetectorRefs.detectChanges();
  }

  /**画像を登録 */
  private sendImage(list: LostItemPictureInfo[]){
    this.lostItemListService.updateImage(list).pipe().subscribe(result => {

      this.SharedService.lostItemDataChanged = true;

      if(result == DBUpdateResult.Error){
        this.SharedService.lostItemDataChanged = false;
        Common.modalMessageError(Message.TITLE_ERROR, '忘れ物イメージ画像' + Message.UPDATE_ERROR, MessagePrefix.ERROR + FunctionId.LOSTITEMLIST_FORM + '006').then(() => {
        });
      }
      this.router.navigate([this.navUrl], { relativeTo: this.route });
    });
  }
}
