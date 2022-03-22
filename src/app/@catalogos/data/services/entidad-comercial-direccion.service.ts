import { Injectable } from '@angular/core';

import { catchError, first, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EntidadComercialDireccion } from '../models/entidadComercialDireccion';

@Injectable({
  providedIn: 'root'
})
export class EntidadComercialDireccionService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/entidadesComercialesDirecciones";

  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService) {
    if (!this.recurso.value) {
      this.cargarRecurso().pipe(
        first(val => val != null)
      ).subscribe(() => { },
        (error) => {
          this.sweetService.sweet_alerta('Error', 'No es posible cargar el Recurso', 'error');
          this.paginaAnterior();
        }
      );
    }
  }

  cargarRecurso() {
    this.setCargando(true);
    return this.http.options(this.urlEndPoint).pipe(
      tap(res => console.log(res)),
      map((response: any) => response.aguilaData as Recurso),
      tap(recurso => {
        this.recurso.next(recurso);
        this.setCargando(false);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      map((response: any) => response.aguilaData as EntidadComercialDireccion),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  crear(item: EntidadComercialDireccion) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      map((res: any) => res.aguilaData as EntidadComercialDireccion),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: EntidadComercialDireccion) {
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + "/" + item.id, item).pipe(
      map((res: any) => res.aguilaData as boolean),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  eliminar(id: number) {
    this.sweetService.sweet_carga('Espere...');
    return this.http.delete(this.urlEndPoint + `/${id}`).pipe(
      map((response: any) => response.aguilaData as boolean),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getLista(idEntidadComercial: number) {
    if (this.validarPermiso('Consultar')) {
      return this.http.get(this.urlEndPoint +
        `?idEntidadComercial=${idEntidadComercial}`).pipe(
          map((response: any) => response.aguilaData as EntidadComercialDireccion[]),
          catchError((e) => {
            this.sweetService.sweet_Error(e);
            return throwError(e);
          })
        );
    } else {
      this.errorPermiso();
    }
  }

  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  errorPermiso() {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre);
  }

  setCargando(estado: boolean) {
    this.cargando.next(estado);
  }

  getCargando(): Observable<boolean> {
    return this.cargando.asObservable();
  }

  paginaAnterior() {
    this.configService.regresar();
  }
}
