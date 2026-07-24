import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private renderer: Renderer2;

  // Modo de tema (claro/escuro) — unica preferencia de aparencia disponivel ao usuario.
  public themeColor: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('themeColor') || 'light'
  );

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.renderer.setAttribute(document.documentElement, 'data-bs-theme', this.themeColor.value);
  }

  public changeThemeColor(themeColor: string): void {
    this.themeColor.next(themeColor);
    localStorage.setItem('themeColor', themeColor);
    this.renderer.setAttribute(document.documentElement, 'data-bs-theme', themeColor);
  }
}
