import { Common } from '../../core/common';
import { SystemConst, Message } from '../../core/system.const';
import { AbstractControl } from '@angular/forms';
import moment from 'moment';

export namespace LumpDeleteCommon {

  export class CustomValidator {

    /** 更新日前 ≦ 更新日後
     * @param  {AbstractControl} ac コントロール
     */
    static dateFromTo (ac: AbstractControl) {
      const udtBefore = ac.get('udtBefore').value;
      const udtAfter = ac.get('udtAfter').value;

      if (!Common.IsNullOrEmpty(udtBefore) && !Common.IsNullOrEmpty(udtAfter)) {
        var diff = moment(udtAfter).diff(moment(udtBefore), 'days')
        if (diff < 0){
          ac.get('udtAfter').setErrors({ FromToError: true });
        }
      }
    };
  }
}
