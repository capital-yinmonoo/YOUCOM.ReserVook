import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface DialogData {
    // title: string;
    // message: string;
    // disableClose: boolean;
}


@Component({
    selector: './app-loader',
    styleUrls: ['./loader.component.scss'],
    templateUrl: './loader.component.html',
})
export class LoaderComponent implements OnInit, OnDestroy {

    public static Shown: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<LoaderComponent>,
        @Inject(MAT_DIALOG_DATA) public modalData: DialogData) { }

    ngOnInit() {
        console.log(this.modalData);
        this.dialogRef.disableClose = true;
        LoaderComponent.Shown = true
    }

    ngOnDestroy() {
        LoaderComponent.Shown = false;
    }

    actionFunction() {
        this.closeModal();
    }

    closeModal() {
        this.dialogRef.close();
    }

}
