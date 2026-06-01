import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Loader } from '../../services/loader';

@Component({
  selector: 'app-app-loader',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './app-loader.html',
  styleUrl: './app-loader.scss',
})
export class AppLoader {

  readonly loader = inject(Loader);

}