import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { UserProfile } from '../../../core/models/user.model';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('password')?.value;
  const confirmacao = group.get('password_confirmation')?.value;
  return senha === confirmacao ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-meus-dados',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './meus-dados.component.html',
  styleUrl: './meus-dados.component.scss',
})
export class MeusDadosComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly perfil = signal<UserProfile | null>(null);
  readonly carregandoPerfil = signal(true);
  readonly salvandoDados = signal(false);
  readonly salvandoSenha = signal(false);
  readonly enviandoAvatar = signal(false);
  readonly mensagemDados = signal<string | null>(null);
  readonly erroDados = signal<string | null>(null);
  readonly mensagemSenha = signal<string | null>(null);
  readonly erroSenha = signal<string | null>(null);
  readonly erroAvatar = signal<string | null>(null);

  readonly dadosForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    full_name: [''],
    phone: [''],
    birth_date: [''],
  });

  readonly senhaForm: FormGroup = this.fb.group(
    {
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    this.profileService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.carregandoPerfil.set(false)))
      .subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.dadosForm.patchValue({
            name: perfil.name,
            email: perfil.email,
            full_name: perfil.full_name ?? '',
            phone: perfil.phone ?? '',
            birth_date: perfil.birth_date ?? '',
          });
        },
        error: () => this.erroDados.set('Não foi possível carregar seus dados agora.'),
      });
  }

  salvarDados(): void {
    if (this.dadosForm.invalid || this.salvandoDados()) {
      this.dadosForm.markAllAsTouched();
      return;
    }

    this.salvandoDados.set(true);
    this.mensagemDados.set(null);
    this.erroDados.set(null);

    this.profileService
      .updateProfile(this.dadosForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.salvandoDados.set(false)))
      .subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.authService.updateCurrentUser({ name: perfil.name, email: perfil.email });
          this.mensagemDados.set('Dados atualizados com sucesso.');
        },
        error: () => this.erroDados.set('Não foi possível salvar seus dados agora. Tente novamente.'),
      });
  }

  salvarSenha(): void {
    if (this.senhaForm.invalid || this.salvandoSenha()) {
      this.senhaForm.markAllAsTouched();
      return;
    }

    this.salvandoSenha.set(true);
    this.mensagemSenha.set(null);
    this.erroSenha.set(null);

    this.profileService
      .updatePassword(this.senhaForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.salvandoSenha.set(false)))
      .subscribe({
        next: () => {
          this.mensagemSenha.set('Senha atualizada com sucesso.');
          this.senhaForm.reset();
        },
        error: (err: unknown) =>
          this.erroSenha.set(this.extrairMensagemErro(err) ?? 'Não foi possível atualizar a senha.'),
      });
  }

  onAvatarSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    this.erroAvatar.set(null);
    this.enviandoAvatar.set(true);

    this.profileService
      .uploadAvatar(arquivo)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.enviandoAvatar.set(false)))
      .subscribe({
        next: (avatarUrl) => {
          this.perfil.update((atual) => (atual ? { ...atual, avatar_url: avatarUrl } : atual));
        },
        error: () => this.erroAvatar.set('Não foi possível enviar o avatar agora.'),
      });

    input.value = '';
  }

  private extrairMensagemErro(err: unknown): string | null {
    if (err && typeof err === 'object' && 'error' in err) {
      const corpo = (err as { error?: { fields?: Record<string, string[]> } }).error;
      if (corpo?.fields) {
        return Object.values(corpo.fields).flat().join(' ');
      }
    }
    return null;
  }
}
