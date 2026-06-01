import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogModule
  ],
  templateUrl: './app-confirm-dialog.html',
  styleUrl: './app-confirm-dialog.scss',
})
export class AppConfirmDialog {

}