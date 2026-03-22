import { Injectable, signal } from '@angular/core';

export interface MenuItem {
  menuValue: string;
  icon: string;
  route?: string;
  base?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
  subMenus?: SubMenuItem[];
}

export interface SubMenuItem {
  menuValue: string;
  route: string;
  base?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
  customSubmenuTwo?: boolean;
  subMenusTwo?: SubMenuItemTwo[];
}

export interface SubMenuItemTwo {
  menuValue: string;
  route: string;
  base?: string;
}

export interface MenuSection {
  tittle: string;
  showAsTab: boolean;
  menu: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  readonly menuSections = signal<MenuSection[]>([
    {
      tittle: 'PRINCIPAL',
      showAsTab: false,
      menu: [
        {
          menuValue: 'Dashboard',
          icon: 'dashboard',
          route: '/user/dashboard',
          base: 'user',
          hasSubRoute: false,
          showSubRoute: false,
        },
      ],
    },
    {
      tittle: 'CONTEÚDO',
      showAsTab: true,
      menu: [
        {
          menuValue: 'Registros de estudos',
          icon: 'file-text',
          base: 'questoes',
          hasSubRoute: true,
          showSubRoute: false,
          subMenus: [
            { menuValue: 'Matérias', route: '/materias/listar', base: 'listar' },
          ],
        },
        {
          menuValue: 'Cronograma de estudos',
          icon: 'clipboard-list',
          base: 'simulados',
          hasSubRoute: true,
          showSubRoute: false,
          subMenus: [
            { menuValue: 'Listar Cronogramas', route: '/simulados/listar', base: 'listar' },
            { menuValue: 'Criar Cronograma', route: '/simulados/criar', base: 'criar' },
          ],
        },
        {
          menuValue: 'Simulados',
          icon: 'notebook',
          base: 'simulados-realizados',
          hasSubRoute: true,
          showSubRoute: false,
          subMenus: [
            { menuValue: 'Simulados realizados', route: '/simulados-realizados/listar', base: 'listar' },
            { menuValue: 'Novo Simulado', route: '/simulados-realizados/cadastrar', base: 'cadastrar' },
          ],
        },
        {
          menuValue: 'Mentor de Estudos',
          icon: 'school',
          base: 'mentor',
          hasSubRoute: true,
          showSubRoute: false,
          subMenus: [
            { menuValue: 'Iniciar Chat', route: '/mentor/chat', base: 'chat' },
          ],
        },
      ],
    },
  ]);
}
