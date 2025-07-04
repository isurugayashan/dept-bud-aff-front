import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  lines: string[] = [];

  constructor(public dialogRef: MatDialogRef<MessageComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    if (this.data.message.error && typeof this.data.message.error === 'object') {
      // Handle object error message
      const errorMessage = this.data.message.error.errors || 'An unexpected error occurred.';
      this.lines = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
    } else {
      // Handle string error message
      this.lines = this.data.message.split('<br>').filter((line: string) => line !== '');
    }
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('custom-dialog');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
