import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';

export class BookingsCondition {
  //** 会社No */
  companyNo: string;
  //** 日付(From) */
  startDate: string;
  //** 日付(To) */
  endDate: string;
  //** 表示日数 */
  displayDays: number;
}

export class BookingsInfo {
  roomNo: string;
  roomName: string;
  roomType: string;
  roomTypeName: string;
  displayOrder: number;
  assignList: Array<BookingsAssignInfo> = [];
}

export class BookingsAssignInfo {
  useDate: string;
  reserveNo: string;
}

