import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../services/auth';
import { AUTH_CONFIG } from '../../providers/auth.provider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, PasswordModule, ButtonModule],
  template: `
    <p-dialog header="Cambiar contraseña" [(visible)]="visible" [modal]="true" [style]="{width: '400px'}" appendTo="body" (onHide)="onHide()">
      
      <div *ngIf="backendError()" class="p-mb-3 text-red-500 font-bold mb-3">
        {{ backendError() }}
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
        
        <div class="flex flex-col gap-2">
          <label for="currentPassword">Contraseña actual</label>
          <p-password id="currentPassword" formControlName="currentPassword" [toggleMask]="true" [feedback]="false" styleClass="w-full" inputStyleClass="w-full"></p-password>
          <small class="text-red-500" *ngIf="form.get('currentPassword')?.touched && form.get('currentPassword')?.invalid">
            Este campo es requerido.
          </small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="newPassword">Nueva contraseña</label>
          <p-password id="newPassword" formControlName="newPassword" [toggleMask]="true" [feedback]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
          <small class="text-red-500" *ngIf="form.get('newPassword')?.touched && form.get('newPassword')?.hasError('required')">
            Este campo es requerido.
          </small>
          <small class="text-red-500" *ngIf="form.get('newPassword')?.touched && form.get('newPassword')?.hasError('sameAsCurrent')">
            La nueva contraseña debe ser diferente a la actual.
          </small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="confirmPassword">Confirmar nueva contraseña</label>
          <p-password id="confirmPassword" formControlName="confirmPassword" [toggleMask]="true" [feedback]="false" styleClass="w-full" inputStyleClass="w-full"></p-password>
          <small class="text-red-500" *ngIf="form.get('confirmPassword')?.touched && form.get('confirmPassword')?.hasError('required')">
            Este campo es requerido.
          </small>
          <small class="text-red-500" *ngIf="form.get('confirmPassword')?.touched && form.hasError('mismatch')">
            Las contraseñas no coinciden.
          </small>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <p-button label="Cancelar" severity="secondary" (click)="visible = false" type="button"></p-button>
          <p-button label="Guardar" type="submit" [disabled]="form.invalid || loading()"></p-button>
        </div>
      </form>
    </p-dialog>
  `
})
export class ChangePasswordComponent {
  visible = false;
  
  form: FormGroup;
  loading = signal(false);
  backendError = signal<string | null>(null);

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private messageService = inject(MessageService);
  private config = inject(AUTH_CONFIG);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: [this.passwordMatchValidator, this.passwordDifferentValidator] });
  }

  show() {
    this.form.reset();
    this.backendError.set(null);
    this.visible = true;
  }

  onHide() {
    this.form.reset();
    this.backendError.set(null);
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  passwordDifferentValidator(group: AbstractControl): ValidationErrors | null {
    const current = group.get('currentPassword')?.value;
    const newPassword = group.get('newPassword')?.value;
    if (current && newPassword && current === newPassword) {
      group.get('newPassword')?.setErrors({ ...group.get('newPassword')?.errors, sameAsCurrent: true });
      return { sameAsCurrent: true };
    }
    return null;
  }

  submit() {
    if (this.form.invalid) return;
    
    const user = this.auth.currentUser();
    if (!user || !user.id) {
      this.backendError.set('No se encontró el ID del usuario.');
      return;
    }

    this.loading.set(true);
    this.backendError.set(null);

    const payload = this.form.value;

    const urlTemplate = this.config.changePasswordUrl || `/api/users/{id}/change-password`;
    const finalUrl = urlTemplate.replace('{id}', user.id);

    console.log('AUTH CONFIG', this.config);
    console.log('CHANGE PASSWORD URL', this.config.changePasswordUrl);
    console.log('FINAL URL', finalUrl);

    this.http.post(finalUrl, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente' });
        this.visible = false;
        
        // Auto logout
        this.auth.logout();
        this.router.navigate(['/auth/login']); // Redirect to login using router
      },
      error: (err) => {
        this.loading.set(false);
        // The backend validation or 401 error message
        this.backendError.set(err.error?.message || 'Error al cambiar la contraseña');
      }
    });
  }
}
