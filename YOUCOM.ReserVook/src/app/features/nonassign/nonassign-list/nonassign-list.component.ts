import { RoomsAssignCondition } from './../../rooms/model/rooms.model';
import { RoomService } from './../../rooms/services/room.service';
import { AuthService } from './../../../core/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/core/auth/auth.model';
import { NotAssignedInfo } from '../../rooms/model/rooms.model';

@Component({
  selector: 'app-nonassign-list',
  templateUrl: './nonassign-list.component.html',
  styleUrls: ['./nonassign-list.component.scss']
})

export class NonAssignListComponent implements OnInit {

  private currentUser: User;

  public NonAssignList: NotAssignedInfo[];
  public ngx_table_messages = {
    'emptyMessage': '該当データなし',
    'totalMessage': '件'
  };

  constructor(private router: Router,
              private roomService: RoomService,
              private authService: AuthService) {
    this.currentUser = authService.getLoginUser();
  }

  ngOnInit(): void {

    // 条件セット
    const cond: RoomsAssignCondition = {
      companyNo: this.currentUser.displayCompanyNo,
      useDate: "",
      viewCOFlg: false
    };

    this.roomService.getDailyNotAssignInfo(cond).subscribe((res : NotAssignedInfo[]) => {
      this.NonAssignList = res;
    });

  }

}
