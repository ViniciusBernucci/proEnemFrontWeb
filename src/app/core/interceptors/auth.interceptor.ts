import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Recupera o token do localStorage (ajustar conforme sua implementação de auth)
  const token = localStorage.getItem('auth_token');

  // Se houver token, clona a requisição e adiciona o header Authorization
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // Se não houver token, prossegue com a requisição original
  return next(req);
};
