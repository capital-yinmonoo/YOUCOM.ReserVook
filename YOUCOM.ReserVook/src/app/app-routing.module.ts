import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		loadChildren: './core/layout/layout.module#LayoutModule'
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes,
      {
         enableTracing: false, // <-- debugging purposes only
         useHash: true  // <-- ハッシュ付きURLを有効にする。リロードエラー対策
       }
		),
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
