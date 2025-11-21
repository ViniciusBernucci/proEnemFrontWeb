import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  // rota local mínima caso o shared routes não exista
  routes = {
    login: '/login'
  };

  constructor(private router: Router) {}

  public navigate() {
    // aqui normalmente faria a chamada para criar o usuário
    // após sucesso, redireciona para a tela de login
    this.router.navigate([this.routes.login]);
  }

  public password : boolean[] = [false];

  public togglePassword(index: any){
    this.password[index] = !this.password[index]
  }
}
