import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ConfirmDialogData = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ){}

  onCancel(){ this.dialogRef.close(false); }
  onConfirm(){ this.dialogRef.close(true); }
}
