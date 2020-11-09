import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/layout/header/header.service';
import moment from 'moment';
import { Cleaning } from '../../cleanings/model/cleaning.model';
import { CleaningService } from '../../cleanings/services/cleaning.service';
import { Common } from 'src/app/core/common';
import { PrintPage } from 'src/app/core/system.const';

@Component({
  selector: 'cleaning-print',
  templateUrl: './cleaning-print.component.html',
  styleUrls: ['./cleaning-print.component.scss']
})

export class CleaningPrintComponent implements OnInit {

  private readonly listURL = '/company/cleanings';
  private readonly printRowCount = 40;

  private _data: Cleaning[];
  private _printDate: Date;
  public printFormatDate : string;
  public _header: any[];
  public printList = [];
  public printDateTime :string;

  constructor(private router: Router
              , private header: HeaderService
              , public cleaningService: CleaningService) {

    this._printDate = this.cleaningService.printDate;
    this._header = this.cleaningService.header;
    this._data = this.cleaningService.data;
  }

  ngOnInit(): void {
    moment.locale("ja");  // 曜日を日本語表記にする
    this.printDateTime = moment().format('llll');  // YYYY年M月D日(ddd) hh:mm

    this.settings(true);

    if(this._data != null){
      this.setData();
    }else{
      // データがなければ一覧に戻る
      this.router.navigate([this.listURL]);
    }
  }

  /** 現在のコンポーネントを生成したとき */
  ngAfterViewInit(){
    Common.setPrintPage(document, PrintPage.A4_PORTRAIT);
    setTimeout( () => {
      window.print(); // 印刷ダイアログ
      this.router.navigate([this.listURL]); // 印刷したら戻る
    }, 100);
  }

  /** 画面を閉じる際にデータをクリア */
  ngOnDestroy(){
    this.settings(false);
    this.cleaningService.header = null;
    this.cleaningService.data = null;
  }

  settings(printMode: boolean){
    if(printMode){
      this.header.hide(); // ヘッダを隠す
    }else{
      this.header.show(); // ヘッダを再表示
    }
  }

  /** 受け取ったデータを表示用に整形 */
  private setData(){

    this.printFormatDate = moment(this._printDate).format('YYYY年M月D日(ddd)')

    var rowCount = 0;
    var pageInfo = [];
    var rowInfo = [];

    this._data.forEach(x => {

      let cInsRowCount = 0;
      let cRemarksRowCount = 0;

      for(let i = 0; i < this._header.length; i++){
        switch(this._header[i].prop){
          case "floor":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.floor })
            break;
          case "roomNo":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.roomNo })
            break;
          case "roomType":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.roomType })
            break;
          case "smoking":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.smokingName })
            break;
          case "roomStatus":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.roomStatus })
            break;
          case "nights":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.nights })
            break;
          case "man":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.man })
            break;
          case "woman":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.woman })
            break;
          case "childA":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.childA })
            break;
          case "childB":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.childB })
            break;
          case "childC":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.childC })
            break;
          case "memberTotal":
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.memberTotal })
            break;
          case "cleaningInstruction":
            cInsRowCount = this.checkRowCount(x.cleaningInstruction);
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.cleaningInstruction })
            break;
          case "cleaningRemarks":
            cRemarksRowCount = this.checkRowCount(x.cleaningRemarks);
            rowInfo.push({ visible: this._header[i].visible, prop: this._header[i].prop, value: x.cleaningRemarks })
            break;
        }
      }

      // 折り返して全行表示する
      if(cInsRowCount > 1 || cRemarksRowCount > 1){
        let maxCount = (cInsRowCount >= cRemarksRowCount) ? cInsRowCount : cRemarksRowCount;
        if( (maxCount + rowCount) > this.printRowCount){
          rowCount = 0;
          this.printList.push(pageInfo);
          pageInfo =[];
        }
        rowCount += maxCount - 1;
      }

      pageInfo.push(rowInfo);
      rowCount++;
      rowInfo = [];

      if(rowCount == this.printRowCount){
        rowCount = 0;
        this.printList.push(pageInfo);
        pageInfo =[];
      }
    });

    if(rowCount != 0){
      // max行まで空行を表示しない
      // for(let i = rowCount; i < this.printRowCount; i++){
      //   for (let j = 0; j < this._header.length; j++) {
      //     rowInfo.push({ visible: this._header[j].visible, prop: this._header[j].prop, value: '' })
      //   }
      //   pageInfo.push(rowInfo);
      //   rowInfo = [];
      // }
      this.printList.push(pageInfo);
    }

  }

  private checkRowCount(value) : number{
    // HACK: 清掃指示･備考はレイアウトの都合上8文字までで折り返して表示する
    const maxLength = 8;
    let rowsCount = 1;
    let checkLength = value.length;

    if (checkLength > maxLength ){
      rowsCount = Math.trunc(checkLength / maxLength);
      rowsCount += (checkLength % maxLength > 0) ? 1 : 0;
    }
    return rowsCount;
  }

  public ReplaceHeader(value : string) : string {

    var result : string = value;
    if (Common.IsNullOrEmpty(result)) return result

    result = result.replace('部屋番号','部屋');
    result = result.replace('喫煙/禁煙','喫/禁');
    result = result.replace('合計人数','合計');

    return result
  }

  public ReplaceValue(value : string, prop: string) : string {

    var result : string = value;
    if (Common.IsNullOrEmpty(result)) return result;

    switch(prop){

      case 'cleaningInstruction':
      case 'cleaningRemarks':
        // 清掃指示･備考はレイアウトの都合上8文字まで表示。超えたら8文字目を「…」に置換
        // const maxLength = 8;
        // if (value.length > maxLength ){
        //   result = result.substring(0, maxLength - 1) + "..."
        // }
        break;

      case 'roomStatus':
        result = result.replace('チェンジ','');
        result = result.replace('チェック','');
        break;

      default:
        break;
    }

    return result
  }
}
