import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MascotService {
  visible = signal<boolean>(true);

  toggle(): void {
    this.visible.update(v => !v);
  }
}
