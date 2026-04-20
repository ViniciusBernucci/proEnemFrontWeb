import { Component, OnInit, OnDestroy, signal, inject, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MascotService } from './mascot.service';

interface AnimationStep {
  rows: number[];          // linhas do sprite a percorrer neste passo
  framesPerRow: number | number[]; // frames por linha (número único ou array por linha)
  fps: number;             // frames por segundo
  durationSeconds: number; // quanto tempo ficar neste passo antes de avançar
  label: string;
}

@Component({
  selector: 'app-mascot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mascot.component.html',
  styleUrl: './mascot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MascotComponent implements OnInit, OnDestroy {
  readonly FRAME_WIDTH  = 64;
  readonly FRAME_HEIGHT = 64;
  readonly SCALE        = 2;
  readonly SHEET_COLS   = 14;

  // ─── Sequência de animações ───────────────────────────────────────────────
  // Cada passo executa por durationSeconds e depois avança para o próximo.
  // Ao terminar o último, volta ao primeiro (loop infinito).
  readonly sequence: AnimationStep[] = [
    {
      rows: [13],
      framesPerRow: 8,
      fps: 0.5,            // 1 frame a cada 2 segundos
      durationSeconds: 10, // 1 minuto sentado
      label: 'sit',
    },
    {
      rows: [19],
      framesPerRow: 3,
      fps: 2,              // 2 frames por segundo
      durationSeconds: 300,// 5 minutos
      label: 'play',
    },
    {
      rows: [18, 19],      // percorre linha 18 completa, depois linha 19, em loop
      framesPerRow: 5,
      fps: 2,              // 2 frames por segundo
      durationSeconds: 300,// 5 minutos
      label: 'play2',
    },
    {
      rows: [20],
      framesPerRow: 5,
      fps: 1,              // 1 frame por segundo
      durationSeconds: 60, // 1 minuto
      label: 'walk',
    },
  ];

  readonly mascotService = inject(MascotService);
  private readonly ngZone = inject(NgZone);

  // ─── Estado interno ───────────────────────────────────────────────────────
  currentStepIndex = signal(0);
  currentRowIndex  = signal(0);
  currentFrame     = signal(0);

  private frameTimer?: ReturnType<typeof setInterval>;
  private stepTimer?:  ReturnType<typeof setTimeout>;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private get step(): AnimationStep {
    return this.sequence[this.currentStepIndex()];
  }

  private get activeRow(): number {
    return this.step.rows[this.currentRowIndex()];
  }

  private get framesInRow(): number {
    const f = this.step.framesPerRow;
    return Array.isArray(f) ? f[this.currentRowIndex()] : f;
  }

  // ─── Estilo do sprite ─────────────────────────────────────────────────────
  get spriteStyle(): Record<string, string> {
    const x = -(this.currentFrame() * this.FRAME_WIDTH  * this.SCALE);
    const y = -(this.activeRow      * this.FRAME_HEIGHT * this.SCALE);
    return {
      width:              `${this.FRAME_WIDTH  * this.SCALE}px`,
      height:             `${this.FRAME_HEIGHT * this.SCALE}px`,
      backgroundImage:    `url('assets/images/mascot.png')`,
      backgroundSize:     `${this.FRAME_WIDTH * this.SHEET_COLS * this.SCALE}px auto`,
      backgroundPosition: `${x}px ${y}px`,
      backgroundRepeat:   'no-repeat',
      imageRendering:     'pixelated',
    };
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.startStep(0);
  }

  ngOnDestroy(): void {
    clearInterval(this.frameTimer);
    clearTimeout(this.stepTimer);
  }

  // ─── Player de sequência ──────────────────────────────────────────────────
  // Os timers rodam fora da zone do Angular para não disparar change detection
  // a cada tick — evita NG0100 em outros componentes da página.
  private startStep(index: number): void {
    clearInterval(this.frameTimer);
    clearTimeout(this.stepTimer);

    this.currentStepIndex.set(index);
    this.currentRowIndex.set(0);
    this.currentFrame.set(0);

    const step = this.sequence[index];

    // Signals são zone-agnostic no Angular 17+ — atualizam o template sem
    // re-entrar na zone, evitando disparar change detection global.
    this.ngZone.runOutsideAngular(() => {
      this.frameTimer = setInterval(() => {
        const next = this.currentFrame() + 1;
        if (next < this.framesInRow) {
          this.currentFrame.set(next);
        } else {
          const nextRow = (this.currentRowIndex() + 1) % step.rows.length;
          this.currentRowIndex.set(nextRow);
          this.currentFrame.set(0);
        }
      }, 1000 / step.fps);

      this.stepTimer = setTimeout(() => {
        this.startStep((index + 1) % this.sequence.length);
      }, step.durationSeconds * 1000);
    });
  }
}
