import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private http = inject(HttpClient);
  
  sendMessage(text: string): Observable<ChatMessage> {
    const aiResponse: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'ai',
      text: this.generateMockAIResponse(text),
      timestamp: new Date()
    };
    return of(aiResponse).pipe(delay(Math.random() * 1000 + 1500)); // Delay between 1.5s and 2.5s
  }

  private generateMockAIResponse(userInput: string): string {
    const input = userInput.toLowerCase();
    if (input.includes('matemática') || input.includes('calculo') || input.includes('função')) {
      return 'A matemática exige muita prática! Posso montar um cronograma de exercícios ou revisar os princípios com você. Por onde quer começar?';
    }
    if (input.includes('redação') || input.includes('texto')) {
      return 'Na redação, a introdução com a sua tese é o motor do texto. Tem algum tema em mente que gostaria de debater?';
    }
    if (input.includes('história') || input.includes('revolução')) {
      return 'Para história e humanas, mapas mentais ajudam demais a conectar fatos. Já tentou desenhar um hoje?';
    }
    return 'Excelente observação. Como mentor, considero a consistência o segredo da aprovação. Se quiser, olhamos o seu Tracker de Estudos para organizar seu dia!';
  }
}
