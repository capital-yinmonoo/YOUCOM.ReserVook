import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class SharedService {
  // 受け渡しを行うプロパティ
  lostItemDataChanged : boolean = true;

  // 表示している日付の保存
  displayDate : Date = new Date();
}
