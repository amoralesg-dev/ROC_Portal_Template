import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-app-toast',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule
  ],
  templateUrl: './app-toast.html',
  styleUrl: './app-toast.scss'
})
export class AppToast {

  constructor() {
    console.log('APP TOAST CARGADO');
}

}