import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw      = group.get('password')?.value;
  const confirm = group.get('password_confirmation')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private fb     = inject(FormBuilder);

  registerForm: FormGroup = this.fb.group(
    {
      name:                  ['', [Validators.required, Validators.minLength(2)]],
      phone:                 [''],
      email:                 ['', [Validators.required, Validators.email]],
      password:              ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      terms:                 [false],
    },
    { validators: passwordMatchValidator },
  );

  submitted = false;
  message:   string | null = null;
  error:     string | null = null;
  loading    = false;
  password:  boolean[] = [false, false, false];

  navigate(): void {
    this.submitted = true;
    this.error = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.registerForm.get('terms')?.value) {
      this.error = 'Você precisa aceitar os Termos de Uso para continuar.';
      return;
    }

    const { name, email, password, password_confirmation, phone } = this.registerForm.value;
    this.loading = true;

    this.auth.register({ name, email, password, password_confirmation, phone }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/user/dashboard']);
      },
      error: (err: Error) => {
        this.loading = false;
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
}
