import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      // verificamos si no expira el token asignado
      if (this.isTokenExpirado()) {
        this.authService.logout();
        this.router.navigate(['/security/login']);
        return false;
      }
      return true;
    }
    this.router.navigate(['/security/login']);
    return false;
  }

  isTokenExpirado(): boolean {
    // con este metodo no es necesario ir al backend para comprobar si ya expiro un token
    let token = this.authService.token;
    let payload = this.authService.obtenerDatosToken(token);
    // fecha actual en segundos, fecha del navegador
    // notar que el atributo del token payload.exp esta en segundos
    let now = new Date().getTime() / 1000;
    if (payload.exp < now ) {
      return true;
    }
    return false;
  }
}