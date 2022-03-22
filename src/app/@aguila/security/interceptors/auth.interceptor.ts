import { SweetService } from './../../../@page/services/sweet.service';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Con este interceptor vamos a manejar todas las respuestas, para validar error 401 y 403
    tambien debemos de registrar esta clase en appmodules en providers
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService, private router: Router, private sweetService:SweetService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(e => {
                // Si no hay coneccion a internet o el tiempo de espera se agota
                if(e.status ===0 ){
                    this.sweetService.sweet_alerta('Error de Conexión','No es posible conectarse al servidor','error');
                }
                // si no esta esta autenticado
                if (e.status === 401) {
                    // por si expira el token que cierre session
                    if (this.authService.isAuthenticated()) {
                        this.authService.logout();
                    }
                    this.router.navigate(['/security/login']);
                    this.sweetService.sweet_alerta('Sesión Expirada','Vuelva a inicar sesión para continuar','error');
                }
                // si esta autenticado pero no tiene permiso
                if (e.status === 403) {
                    this.router.navigate(['/aguila/home']);
                    this.sweetService.sweet_alerta('Acceso Denegado',`Hola ${this.authService.usuario.nombre} no tienes acceso a este recurso`,'error');
                }
                return throwError(e);
            })
        );
    }
}