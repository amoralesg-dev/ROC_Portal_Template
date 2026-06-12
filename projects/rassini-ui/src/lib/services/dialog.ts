import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface DialogOptions {

    header?: string;

    message: string;

    acceptLabel?: string;

    rejectLabel?: string;

    accept?: () => void;

    reject?: () => void;

}

@Injectable({
    providedIn: 'root'
})
export class Dialog {

    constructor(
        private readonly confirmationService: ConfirmationService
    ) {}

    confirm(
        options: DialogOptions
    ): void {

        this.confirmationService.confirm({

            header: options.header ?? 'Confirmación',

            message: options.message,

            acceptLabel: options.acceptLabel ?? 'Aceptar',

            rejectLabel: options.rejectLabel ?? 'Cancelar',

            acceptButtonProps: {
                severity: 'danger'
            },

            rejectButtonProps: {
                severity: 'secondary'
            },

            accept: options.accept,

            reject: options.reject

        });

    }

}