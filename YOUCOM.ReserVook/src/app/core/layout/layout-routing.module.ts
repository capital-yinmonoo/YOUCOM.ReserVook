import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthSuperAdminGuard, AuthAdminGuard, AuthStaffGuard as AuthUserGuard } from '../auth/auth.guard';

import { LoginComponent } from '../../features/login/login.component';

const layoutRoutes: Routes = [
	{ path: '', redirectTo: '/company/rooms', pathMatch: 'full'},
  { path: 'login', component: LoginComponent},

  // 印刷用(LayoutComponentを含むと正しく印刷できないため)
  { path: 'print', canActivateChild: [ AuthUserGuard ],
    children: [
      { path: 'bill', loadChildren: '../../features/print/bill-print/bill-print.module#BillPrintModule'},
    ]
  },

  //管理者のみ許可する画面
  { path: 'master', component: LayoutComponent, canActivateChild: [ AuthAdminGuard ],
    children: [
      { path: 'company', loadChildren: '../../features/company/company.module#CompanyModule'},
      { path: 'item', loadChildren: '../../features/item/item.module#ItemModule'},
      { path: 'denomination', loadChildren: '../../features/master/denomination/denomination.module#DenominationModule'},
      { path: 'rooms', loadChildren: '../../features/rooms/rooms.module#RoomsModule'},
      { path: 'codename', loadChildren: '../../features/master/codename/codename.module#CodenameModule'},
      { path: 'agent', loadChildren: '../../features/master/agent/agent.module#AgentModule'},
      { path: 'sitecontroller', loadChildren: '../../features/web/master/sitecontroller/sitecontroller.module#SiteControllerModule'},
      { path: 'siteconvert', loadChildren: '../../features/web/master/siteconvert/siteconvert.module#SiteConvertModule'},
      { path: 'roomtypeconvert', loadChildren: '../../features/web/master/roomtypeconvert/roomtypeconvert.module#RoomTypeConvertModule'},
      { path: 'paymentconvert', loadChildren: '../../features/web/master/paymentconvert/paymentconvert.module#PaymentConvertModule'},
      { path: 'pointconvert', loadChildren: '../../features/web/master/pointconvert/pointconvert.module#PointConvertModule'},
      { path: 'remarksconvert', loadChildren: '../../features/web/master/remarksconvert/remarksconvert.module#RemarksConvertModule'},
      { path: 'planconvert', loadChildren: '../../features/web/master/planconvert/planconvert.module#PlanConvertModule'},
      { path: 'facility', loadChildren: '../../features/facility/facility.module#FacilityModule'},
      { path: 'loststate', loadChildren: '../../features/master/loststate/loststate.module#LostStateModule'},
      { path: 'setitem', loadChildren: '../../features/master/setitem/setitem.module#SetItemModule'},
      { path: 'customer', loadChildren: '../../features/master/customer/customer.module#CustomerModule'},
      { path: 'companygroup', loadChildren: '../../features/master/companygroup/companygroup.module#CompanyGroupModule'},
    ]
  },

  //一般ユーザーと管理者のみ許可する画面
  { path: 'company', component: LayoutComponent, canActivateChild: [ AuthUserGuard ],
    children: [
      { path: 'staffs', loadChildren: '../../features/staffs/staffs.module#StaffsModule'},
      { path: 'rooms', loadChildren: '../../features/rooms/rooms.module#RoomsModule'},
      { path: 'ledger', loadChildren: '../../features/ledger/ledger.module#LedgerModule'},
      { path: 'salesreport', loadChildren: '../../features/salesreport/salesreport.module#SaleReportModule'},
      { path: 'confirmincome', loadChildren: '../../features/confirmincome/confirmincome.module#ConfirmincomeModule'},
      { path: 'reserve', loadChildren: '../../features/reserve/reserve.module#ReserveModule'},
      { path: 'bookings', loadChildren: '../../features/bookings/bookings.module#BookingsModule'},
      { path: 'bill', loadChildren: '../../features/bill/bill.module#BillModule'},
      { path: 'webreserves', loadChildren: '../../features/webreserves/webreserves.module#WebreservesModule'},
      { path: 'nonassign', loadChildren: '../../features/nonassign/nonassign.module#NonAssignModule'},
      { path: 'cleanings', loadChildren: '../../features/cleanings/cleanings.module#CleaningsModule'},
      { path: 'namesearch', loadChildren: '../../features/namesearch/namesearch.module#NameSearchModule'},
      { path: 'facility', loadChildren: '../../features/facility/facility.module#FacilityModule'},
      { path: 'lostitemlist', loadChildren: '../../features/lostitemlist/lostitemlist.module#LostItemListModule'},
      { path: 'trustyou', loadChildren: '../../features/trustyou/trustyou.module#TrustyouModule'},
      { path: 'dishreport', loadChildren: '../../features/dishreport/dishreport.module#DishReportModule'},
      { path: 'dataimport', loadChildren: '../../features/dataimport/dataimport.module#DataImportModule'},
      { path: 'dataexport', loadChildren: '../../features/dataexport/dataexport.module#DataExportModule'},
    ]
  },
];

@NgModule({
    imports: [RouterModule.forChild(layoutRoutes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
