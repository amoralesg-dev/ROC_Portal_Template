import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule
  ],
  templateUrl: './app-dialog.html',
  styleUrl: './app-dialog.scss',
})
export class AppDialog {

  @Input()
  visible = false;

  @Input()
  title = '';

  @Input()
  width = '50rem';

  @Output()
  visibleChange = new EventEmitter<boolean>();

  @ContentChild('footer')
  footerTemplate?: TemplateRef<any>;

  onHide(): void {

    this.visible = false;

    this.visibleChange.emit(false);

  }

}