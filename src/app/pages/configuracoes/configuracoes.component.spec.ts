import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ConfiguracoesComponent } from './configuracoes.component';

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let fixture: ComponentFixture<ConfiguracoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com a aba "meus-dados" ativa', () => {
    expect(component.abaAtiva()).toBe('meus-dados');
  });

  it('deve trocar abaAtiva para "meu-plano" ao selecionar essa aba', () => {
    component.selecionarAba('meu-plano');

    expect(component.abaAtiva()).toBe('meu-plano');
  });

  it('deve voltar para "meus-dados" ao selecionar essa aba novamente', () => {
    component.selecionarAba('meu-plano');
    component.selecionarAba('meus-dados');

    expect(component.abaAtiva()).toBe('meus-dados');
  });
});
