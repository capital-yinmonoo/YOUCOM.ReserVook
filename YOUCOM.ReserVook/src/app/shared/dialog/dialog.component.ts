import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface DialogData {
    title: string;
    message: string;
    content: string;
    disableClose: boolean;
}


@Component({
    selector: './app-dialog',
    styleUrls: ['./dialog.component.scss'],
    templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnInit, OnDestroy {

    public static Shown: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public modalData: DialogData) {
            DialogComponent.Shown = true;
        }

    ngOnInit() {
        console.log(this.modalData);
        this.dialogRef.disableClose = this.modalData.disableClose;
    }

    ngOnDestroy() {
        DialogComponent.Shown = false;
    }

    actionFunction() {
        this.closeModal();
    }

    closeModal() {
        this.dialogRef.close();
    }

}
