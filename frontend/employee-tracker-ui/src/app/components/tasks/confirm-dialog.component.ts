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
  template: `
  <div class="dialog-container">
    <div class="header" [class.warn]="data.color === 'warn'">
      <mat-icon class="header-icon">{{ data.icon || 'help' }}</mat-icon>
      <div class="titles">
        <h3 class="title">{{ data.title || 'Please confirm' }}</h3>
        <div class="subtitle">{{ data.message }}</div>
      </div>
    </div>

    <div class="actions">
      <button mat-button (click)="onCancel()">{{ data.cancelText || 'Cancel' }}</button>
      <button mat-raised-button [color]="data.color || 'primary'" (click)="onConfirm()">
        {{ data.confirmText || 'OK' }}
      </button>
    </div>
  </div>
  `,
  styles: [`
    .dialog-container{ min-width: 420px; max-width: 640px; padding: 16px 20px; }
    .header{ display:flex; gap:16px; align-items:flex-start; padding: 6px 0 10px; }
    .header.warn .header-icon{ color: #d32f2f; }
    .header-icon{ font-size:32px; width:32px; height:32px; opacity:.9; }
    .titles{ display:flex; flex-direction:column; gap:4px; }
    .title{ margin:0; font-size:20px; font-weight:600; }
    .subtitle{ opacity:.85; line-height: 1.35; font-size: 14px; }
    .actions{ display:flex; justify-content:flex-end; gap:10px; padding-top: 16px; }
    @media (max-width: 520px){
      .dialog-container{ min-width: unset; width: 92vw; max-width: 92vw; padding: 14px 16px; }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ){}

  onCancel(){ this.dialogRef.close(false); }
  onConfirm(){ this.dialogRef.close(true); }
}
