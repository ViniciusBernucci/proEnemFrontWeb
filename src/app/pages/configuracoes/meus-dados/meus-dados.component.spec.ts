import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { MeusDadosComponent } from './meus-dados.component';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile } from '../../../core/models/user.model';

// ─── Factories ────────────────────────────────────────────────────────────────

function makePerfil(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 1,
    name: 'Fulano de Tal',
    email: 'fulano@example.com',
    username: null,
    avatar_url: null,
    full_name: 'Fulano Completo da Silva',
    phone: '11999998888',
    birth_date: '1998-05-20',
    ...overrides,
  };
}

function criarEventoArquivo(arquivo: File | undefined): Event {
  const input = { files: arquivo ? [arquivo] : null, value: '' } as unknown as HTMLInputElement;
  return { target: input } as unknown as Event;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

describe('MeusDadosComponent', () => {
  let component: MeusDadosComponent;
  let fixture: ComponentFixture<MeusDadosComponent>;
  let profileServiceSpy: {
    getProfile: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
    updatePassword: ReturnType<typeof vi.fn>;
    uploadAvatar: ReturnType<typeof vi.fn>;
  };
  let authServiceSpy: { updateCurrentUser: ReturnType<typeof vi.fn> };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function setup(getProfileReturn: Observable<any> = of(makePerfil())) {
    profileServiceSpy = {
      getProfile: vi.fn().mockReturnValue(getProfileReturn),
      updateProfile: vi.fn(),
      updatePassword: vi.fn(),
      uploadAvatar: vi.fn(),
    };
    authServiceSpy = { updateCurrentUser: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MeusDadosComponent],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeusDadosComponent);
    component = fixture.componentInstance;
  }

  // ─── 1. ngOnInit — carregamento do perfil ────────────────────────────────────

  describe('carregamento do perfil no ngOnInit', () => {
    it('deve popular o dadosForm com os dados retornados pelo servico', async () => {
      const perfil = makePerfil();
      await setup(of(perfil));
      fixture.detectChanges();

      expect(component.perfil()).toEqual(perfil);
      expect(component.carregandoPerfil()).toBe(false);
      expect(component.dadosForm.value).toEqual({
        name: perfil.name,
        email: perfil.email,
        full_name: perfil.full_name,
        phone: perfil.phone,
        birth_date: perfil.birth_date,
      });
    });

    it('deve usar string vazia como fallback para campos opcionais nulos', async () => {
      const perfil = makePerfil({ full_name: null, phone: null, birth_date: null });
      await setup(of(perfil));
      fixture.detectChanges();

      expect(component.dadosForm.value.full_name).toBe('');
      expect(component.dadosForm.value.phone).toBe('');
      expect(component.dadosForm.value.birth_date).toBe('');
    });

    it('deve exibir mensagem de erro quando a API falha ao carregar o perfil', async () => {
      await setup(throwError(() => ({ error: {} })));
      fixture.detectChanges();

      expect(component.erroDados()).toBe('Não foi possível carregar seus dados agora.');
      expect(component.carregandoPerfil()).toBe(false);
    });
  });

  // ─── 2. salvarDados ───────────────────────────────────────────────────────────

  describe('salvarDados', () => {
    beforeEach(async () => {
      await setup(of(makePerfil()));
      fixture.detectChanges();
    });

    it('nao deve chamar updateProfile quando o formulario e invalido', () => {
      component.dadosForm.patchValue({ email: 'email-invalido' });

      component.salvarDados();

      expect(profileServiceSpy.updateProfile).not.toHaveBeenCalled();
    });

    it('deve marcar todos os campos como touched quando o formulario e invalido', () => {
      component.dadosForm.patchValue({ name: '' });

      component.salvarDados();

      expect(component.dadosForm.get('name')?.touched).toBe(true);
    });

    it('deve chamar updateProfile e sincronizar o AuthService quando o formulario e valido', () => {
      const perfilAtualizado = makePerfil({ name: 'Nome Atualizado', email: 'atualizado@example.com' });
      profileServiceSpy.updateProfile.mockReturnValue(of(perfilAtualizado));
      component.dadosForm.patchValue({ name: 'Nome Atualizado', email: 'atualizado@example.com' });

      component.salvarDados();

      expect(profileServiceSpy.updateProfile).toHaveBeenCalledWith(component.dadosForm.value);
      expect(authServiceSpy.updateCurrentUser).toHaveBeenCalledWith({
        name: 'Nome Atualizado',
        email: 'atualizado@example.com',
      });
      expect(component.mensagemDados()).toBe('Dados atualizados com sucesso.');
      expect(component.perfil()).toEqual(perfilAtualizado);
    });

    it('deve exibir mensagem de erro quando a API falha ao salvar os dados', () => {
      profileServiceSpy.updateProfile.mockReturnValue(throwError(() => ({ error: {} })));

      component.salvarDados();

      expect(component.erroDados()).toBe('Não foi possível salvar seus dados agora. Tente novamente.');
      expect(component.salvandoDados()).toBe(false);
    });
  });

  // ─── 3. salvarSenha ───────────────────────────────────────────────────────────

  describe('salvarSenha', () => {
    beforeEach(async () => {
      await setup(of(makePerfil()));
      fixture.detectChanges();
    });

    it('deve marcar o formulario como invalido quando as senhas nao coincidem', () => {
      component.senhaForm.patchValue({
        current_password: 'senha-atual',
        password: 'senha-nova-123',
        password_confirmation: 'nao-confere',
      });

      expect(component.senhaForm.hasError('passwordMismatch')).toBe(true);
      expect(component.senhaForm.invalid).toBe(true);
    });

    it('nao deve chamar updatePassword quando as senhas nao coincidem', () => {
      component.senhaForm.patchValue({
        current_password: 'senha-atual',
        password: 'senha-nova-123',
        password_confirmation: 'nao-confere',
      });

      component.salvarSenha();

      expect(profileServiceSpy.updatePassword).not.toHaveBeenCalled();
    });

    it('deve chamar updatePassword e resetar o formulario em caso de sucesso', () => {
      profileServiceSpy.updatePassword.mockReturnValue(of(undefined));
      component.senhaForm.patchValue({
        current_password: 'senha-atual',
        password: 'senha-nova-123',
        password_confirmation: 'senha-nova-123',
      });

      component.salvarSenha();

      expect(profileServiceSpy.updatePassword).toHaveBeenCalled();
      expect(component.mensagemSenha()).toBe('Senha atualizada com sucesso.');
      expect(component.senhaForm.value.current_password).toBeNull();
    });

    it('deve exibir a mensagem de erro vinda dos fields da API quando a senha atual esta incorreta', () => {
      profileServiceSpy.updatePassword.mockReturnValue(
        throwError(() => ({ error: { fields: { current_password: ['A senha atual está incorreta.'] } } })),
      );
      component.senhaForm.patchValue({
        current_password: 'senha-errada',
        password: 'senha-nova-123',
        password_confirmation: 'senha-nova-123',
      });

      component.salvarSenha();

      expect(component.erroSenha()).toBe('A senha atual está incorreta.');
    });
  });

  // ─── 4. onAvatarSelecionado ───────────────────────────────────────────────────

  describe('onAvatarSelecionado', () => {
    beforeEach(async () => {
      await setup(of(makePerfil({ avatar_url: null })));
      fixture.detectChanges();
    });

    it('nao deve chamar uploadAvatar quando nenhum arquivo e selecionado', () => {
      component.onAvatarSelecionado(criarEventoArquivo(undefined));

      expect(profileServiceSpy.uploadAvatar).not.toHaveBeenCalled();
    });

    it('deve atualizar avatar_url do perfil apos upload bem-sucedido', () => {
      const arquivo = new File(['conteudo'], 'avatar.png', { type: 'image/png' });
      profileServiceSpy.uploadAvatar.mockReturnValue(of('http://localhost/storage/avatars/avatar.png'));

      component.onAvatarSelecionado(criarEventoArquivo(arquivo));

      expect(profileServiceSpy.uploadAvatar).toHaveBeenCalledWith(arquivo);
      expect(component.perfil()?.avatar_url).toBe('http://localhost/storage/avatars/avatar.png');
      expect(component.enviandoAvatar()).toBe(false);
    });

    it('deve exibir mensagem de erro quando o upload do avatar falha', () => {
      const arquivo = new File(['conteudo'], 'avatar.png', { type: 'image/png' });
      profileServiceSpy.uploadAvatar.mockReturnValue(throwError(() => ({ error: {} })));

      component.onAvatarSelecionado(criarEventoArquivo(arquivo));

      expect(component.erroAvatar()).toBe('Não foi possível enviar o avatar agora.');
    });
  });
});
