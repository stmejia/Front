import { SweetService } from './../../../@page/services/sweet.service';
import { environment } from './../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private sweetService: SweetService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/security/login']);
      return false;
    }

    switch (next.routeConfig.path) {
      case 'glpi':
        if (this.authService.usuario.modulos.find(el => el.nombre.toLowerCase().trim() == 'glpi')) {
          return true;
        } else {
          return false;
        }
        break;

      case 'logistica':
        if (this.authService.usuario.modulos.find(el => el.nombre.toLowerCase().trim() == 'logística')) {
          return true;
        } else {
          return false;
        }
        break

      case 'aguila':
        if (this.authService.usuario.modulos.find(el => el.nombre.toLowerCase().trim() == 'sistemas')) {
          return true;
        } else {
          return false;
        }
        break;

      case 'catalogos':
        if (this.authService.usuario.modulos.find(el => el.nombre.toLowerCase().trim() == 'catálogos')) {
          return true;
        } else {
          this.sweetService.sweet_alerta('Error', 'Se requieren accesos especiales para acceder al modulo', 'error');
          return false;
        }
        break;

      case 'operaciones':
        if (environment.production == false && this.authService.hasRole('SUPERADMIN')) {
          return true;
        } else {
          return false;
        }
        break;

      case 'prumod':
        if (environment.production == false && this.authService.hasRole('SUPERADMIN')) {
          return true;
        } else {
          this.sweetService.sweet_alerta('Error', 'Se requieren accesos especiales para acceder al modulo', 'error');
          this.router.navigate(['/security/login']);
          this.authService.logout();
          return false;
        }
        break;

      default:
        return true;
        break;
    }
  }

}
