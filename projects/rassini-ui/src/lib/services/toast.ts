import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class Toast {

  constructor(
    private readonly messageService: MessageService
  ) {}

  success(detail: string, summary?: string): void {

    this.messageService.add({
      severity: 'success',
      summary,
      detail
    });

  }

  error(detail: string, summary?: string): void {

    this.messageService.add({
      severity: 'error',
      summary,
      detail
    });

  }

  warn(detail: string, summary?: string): void {

    this.messageService.add({
      severity: 'warn',
      summary,
      detail
    });

  }

  info(detail: string, summary?: string): void {

    this.messageService.add({
      severity: 'info',
      summary,
      detail
    });

  }

  clear(): void {

    this.messageService.clear();

  }

}