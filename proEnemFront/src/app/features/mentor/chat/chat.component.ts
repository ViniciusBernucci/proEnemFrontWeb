import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MentorService, ChatMessage } from '../../../core/services/mentor.service';
import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private mentorService = inject(MentorService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  isLoading = false;
  
  chatForm = this.fb.group({
    message: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    // Initial welcome message from the mentor
    this.messages.push({
      id: 'init-1',
      sender: 'ai',
      text: 'Olá! Sou seu Mentor de Estudos Inteligente. Posso te ajudar a montar cronogramas, tirar dúvidas de matérias, revisar redações ou apenas dar um suporte moral. Sobre o que vamos falar hoje?',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage() {
    if (this.chatForm.invalid || this.isLoading) return;

    const userText = this.chatForm.controls.message.value?.trim();
    if (!userText) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.chatForm.reset();
    this.isLoading = true;

    this.mentorService.sendMessage(userText)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (aiMessage: ChatMessage) => {
          this.messages.push(aiMessage);
        },
        error: (err: unknown) => {
          this.messages.push({
            id: 'err-1',
            sender: 'ai',
            text: 'Tive um pequeno problema ao processar sua resposta. Tente novamente!',
            timestamp: new Date()
          });
        }
      });
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
