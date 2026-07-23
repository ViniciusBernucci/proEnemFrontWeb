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
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private fb     = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email:   ['', [Validators.required, Validators.email, this.noWhitespaceValidator]],
    senha:   ['', [Validators.required, Validators.minLength(6)]],
    lembrar: [false],
  });

  submitted = false;
  message:   string | null = null;
  error:     string | null = null;
  loading    = signal(false);
  password:  boolean[] = [false, false];

  navigate(): void {
    this.submitted = true;
    this.error = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, senha, lembrar } = this.loginForm.value;
    this.loading.set(true);

    this.auth.login({ email, password: senha, remember: lembrar }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/user/dashboard']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error = err.message;
      },
    });
  }

  loginWithGoogle(): void {
    this.auth.loginWithGoogle();
  }

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  noWhitespaceValidator(control: AbstractControl) {
    const val = control.value as string | null;
    return val == null || val.trim().length > 0 ? null : { whitespace: true };
  }
}
