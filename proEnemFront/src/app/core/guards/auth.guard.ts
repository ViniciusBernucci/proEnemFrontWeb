import { CanActivateFn } from '@angular/router';

// TODO: Reativar guard após configurar login com Sanctum
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authGuard: CanActivateFn = (route, state) => {
  // ⚠️ GUARD DESABILITADO TEMPORARIAMENTE PARA TESTES
  return true;
};
