import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService, AuthUser } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  const USER_KEY = 'auth_user';
  const TOKEN_KEY = 'auth_token';

  function configurar(): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(AuthService);
  }

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: vi.fn() };
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('updateCurrentUser', () => {
    const usuarioLogado: AuthUser = { id: 1, name: 'Fulano', email: 'fulano@example.com' };

    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, 'token-fake');
      localStorage.setItem(USER_KEY, JSON.stringify(usuarioLogado));
      configurar();
    });

    it('deve atualizar o signal currentUser fazendo merge com os dados parciais', () => {
      service.updateCurrentUser({ name: 'Novo Nome' });

      expect(service.currentUser()).toEqual({ ...usuarioLogado, name: 'Novo Nome' });
    });

    it('deve persistir o usuario atualizado no localStorage', () => {
      service.updateCurrentUser({ email: 'novo@example.com' });

      const salvo = JSON.parse(localStorage.getItem(USER_KEY) ?? '{}');
      expect(salvo).toEqual({ ...usuarioLogado, email: 'novo@example.com' });
    });

    it('nao deve alterar campos que nao foram passados no partial', () => {
      service.updateCurrentUser({ name: 'Somente Nome Mudou' });

      expect(service.currentUser()?.email).toBe(usuarioLogado.email);
      expect(service.currentUser()?.id).toBe(usuarioLogado.id);
    });
  });

  describe('updateCurrentUser sem usuario logado', () => {
    beforeEach(() => {
      configurar();
    });

    it('nao deve alterar o signal currentUser quando nao ha usuario logado', () => {
      service.updateCurrentUser({ name: 'Nao Deveria Aparecer' });

      expect(service.currentUser()).toBeNull();
    });

    it('nao deve escrever no localStorage quando nao ha usuario logado', () => {
      service.updateCurrentUser({ name: 'Nao Deveria Aparecer' });

      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
  });
});
