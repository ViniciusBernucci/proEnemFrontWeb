import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public navigate() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Simula autenticação — substituir por chamada real
    this.loading.set(true);
    console.log('Form válido:', this.loginForm.value);
    this.router.navigate(['/']);
  }
  public password: boolean[] = [false];
  private router = inject(Router);

  loginForm: FormGroup;
  submitted = false;
  message: string | null = null;
  error: string | null = null;
  loading = signal(false);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.noWhitespaceValidator]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      lembrar: [false],
    });
  }

  // Validador que impede valores compostos só por espaços
  noWhitespaceValidator(control: AbstractControl) {
    const val = control.value as string | null;
    return val == null || val.trim().length > 0 ? null : { whitespace: true };
  }

  hasError(ctrlEmail: string, error: string) {
    const ctrl = this.loginForm.get(ctrlEmail);
    return !!ctrl && ctrl.hasError(error) && (ctrl.touched || this.submitted);
  }

  public togglePassword(index: any) {
    this.password[index] = !this.password[index];
  }
}
