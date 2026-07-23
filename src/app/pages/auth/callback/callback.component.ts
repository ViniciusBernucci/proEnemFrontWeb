import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, AuthUser } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f8f9fa;">
      <p style="color:#adb5bd;font-size:1rem;font-family:Roboto,sans-serif;">Autenticando...</p>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private auth   = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const token   = this.route.snapshot.queryParamMap.get('token');
    const userRaw = this.route.snapshot.queryParamMap.get('user');

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw)) as AuthUser;
        this.auth.handleOAuthCallback(token, user);
        this.router.navigate(['/user/dashboard']);
      } catch {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
