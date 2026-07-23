import { Injectable, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { sidebarDataone } from '../model/sidebar.model';
import { MenuService } from '../../core/services/menu.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private collapseSubject = new BehaviorSubject<boolean>(false);
  collapse$ = this.collapseSubject.asObservable();

  public toggleSideBar: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('isMiniSidebar') || 'false'
  );

  public sideBarPosition: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('sideBarPosition') || 'false'
  );

  public toggleMobileSideBar: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('isMobileSidebar') || 'false'
  );

  public expandSideBar: BehaviorSubject<string> = new BehaviorSubject<string>('false');

  public showDark: BehaviorSubject<string | boolean> = new BehaviorSubject<string | boolean>(
    localStorage.getItem('isDarkTheme') || false
  );

  public side_bar_data: Array<sidebarDataone> = [];

  private collapseSubMenuSource = new Subject<void>();
  collapseSubMenu$ = this.collapseSubMenuSource.asObservable();

  constructor(private menuService: MenuService, rendererFactory: RendererFactory2) {
    rendererFactory.createRenderer(null, null);
    this.expandSideBar.next(localStorage.getItem('isMiniSidebar') === 'true' ? 'false' : 'true');
  }

  toggleCollapse(): void {
    this.collapseSubject.next(!this.collapseSubject.value);
  }

  public switchSideMenuPosition(): void {
    const isMiniSidebar = localStorage.getItem('isMiniSidebar');
    const menuValue = sessionStorage.getItem('menuValue');
    const sections = this.menuService.menuSections();

    if (isMiniSidebar) {
      this.toggleSideBar.next('false');
      this.expandSideBar.next('true');
      localStorage.removeItem('isMiniSidebar');
      sections.forEach((section) => {
        section.menu.forEach((item) => {
          item.showSubRoute = menuValue === item.menuValue;
        });
      });
    } else {
      this.toggleSideBar.next('true');
      this.expandSideBar.next('false');
      localStorage.setItem('isMiniSidebar', 'true');
      sections.forEach((section) => {
        section.menu.forEach((item) => {
          item.showSubRoute = false;
        });
      });
    }
  }

  public switchMobileSideBarPosition(): void {
    if (localStorage.getItem('isMobileSidebar')) {
      this.toggleMobileSideBar.next('false');
      localStorage.removeItem('isMobileSidebar');
    } else {
      this.toggleMobileSideBar.next('true');
      localStorage.setItem('isMobileSidebar', 'true');
    }
  }

  public themeColor(): void {
    if (localStorage.getItem('isDarkTheme')) {
      this.showDark.next('false');
      localStorage.removeItem('isDarkTheme');
    } else {
      this.showDark.next('true');
      localStorage.setItem('isDarkTheme', 'true');
    }
  }

  triggerCollapseSubMenus(): void {
    this.collapseSubMenuSource.next();
  }
}
