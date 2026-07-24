import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProfileService } from './profile.service';
import { API_CONFIG } from '../config/api.config';
import { UpdatePasswordPayload, UpdateProfilePayload, UserProfile } from '../models/user.model';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  const perfilMock: UserProfile = {
    id: 1,
    name: 'Fulano de Tal',
    email: 'fulano@example.com',
    username: null,
    avatar_url: null,
    full_name: null,
    phone: null,
    birth_date: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProfile', () => {
    it('deve fazer GET em /user e extrair response.data', () => {
      let resultado: UserProfile | undefined;

      service.getProfile().subscribe(perfil => (resultado = perfil));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/user`);
      expect(req.request.method).toBe('GET');

      req.flush({ data: perfilMock });

      expect(resultado).toEqual(perfilMock);
    });
  });

  describe('updateProfile', () => {
    it('deve fazer PUT em /user com o payload e extrair response.data', () => {
      const payload: UpdateProfilePayload = { name: 'Novo Nome', email: 'novo@example.com' };
      let resultado: UserProfile | undefined;

      service.updateProfile(payload).subscribe(perfil => (resultado = perfil));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/user`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      const perfilAtualizado = { ...perfilMock, name: 'Novo Nome', email: 'novo@example.com' };
      req.flush({ data: perfilAtualizado });

      expect(resultado).toEqual(perfilAtualizado);
    });
  });

  describe('updatePassword', () => {
    it('deve fazer PUT em /user/password com o payload informado', () => {
      const payload: UpdatePasswordPayload = {
        current_password: 'senha-atual',
        password: 'senha-nova',
        password_confirmation: 'senha-nova',
      };

      service.updatePassword(payload).subscribe();

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/user/password`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      req.flush(null);
    });
  });

  describe('uploadAvatar', () => {
    it('deve fazer POST em /user/avatar com FormData e extrair a avatar_url', () => {
      const arquivo = new File(['conteudo'], 'avatar.png', { type: 'image/png' });
      let avatarUrl: string | undefined;

      service.uploadAvatar(arquivo).subscribe(url => (avatarUrl = url));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/user/avatar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      expect((req.request.body as FormData).get('avatar')).toBe(arquivo);

      req.flush({ data: { avatar_url: 'http://localhost/storage/avatars/avatar.png' } });

      expect(avatarUrl).toBe('http://localhost/storage/avatars/avatar.png');
    });
  });
});
