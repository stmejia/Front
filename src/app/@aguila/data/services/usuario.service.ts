import { RecursoAsignado } from './../models/asigAtributo';
import { catchError, first } from "rxjs/operators";
import { SweetService } from "./../../../@page/services/sweet.service";
import { Usuario } from "./../models/usuario";
import { map, tap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { throwError } from "rxjs";
import { Estaciontrabajo } from "./../models/estaciontrabajo";
import { AsigEstacion } from "./../models/asigEstacion";
import { ConfigService } from './config.service';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { Rol } from '../models/rol';
import { Modulo } from '../models/modulo';
import { Sucursal } from '../models/sucursal';

@Injectable({
  providedIn: "root",
})

export class UsuarioService extends ServicioComponente {

  //Asignacion de Estacion Trabajo
  private urlAsigEstaciones: string =
    environment.UrlAguilaApi + "/api/AsigUsuariosEstaciones";
  estacionesTrabajo: Estaciontrabajo[] = [];

  //UsuarioRecursos
  private urlUsuarioRecurso: string = environment.UrlAguilaApi + "/api/UsuariosRecursos";

  //Asignacion Modulos
  private urlAsigModulos: string = environment.UrlAguilaApi + "/api/AsigUsuariosModulos"


  constructor(protected http: HttpClient, sw: SweetService, cs: ConfigService) {
    super("/api/Usuarios", http, sw, cs);
  }

  bloquear(usuario: Usuario) {
    return this.http
      .put(this.urlEndPoint + `/bloquear/${usuario.id}`, usuario.id).pipe(
        map((res: any) => res.aguilaData as boolean),
        catchError((e) => {
          console.log(e);
          this.sweetService.sweet_Error(e);
          return throwError(e);
        })
      );
  }

  restablecerPassword(usuario: Usuario) {
    return this.http.put(this.urlEndPoint + `/restablecerpassword`, usuario).pipe(
      map((res: any) => res.aguilaData as boolean),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getRoles() {
    return this.http.get(this.getUrlBase() + "/api/Roles").pipe(
      map((res: any) => res as AguilaResponse<Rol[]>),
    );
  }

  getModulos() {
    return this.http.get(this.getUrlBase() + "/api/Modulos").pipe(
      first(), map((res: AguilaResponse<Modulo[]>) => res)
    );
  }

  getEstacionesDeTrabajo() {
    return this.http.get(this.getUrlBase() + "/api/EstacionesTrabajo").pipe(
      first(), map((res: AguilaResponse<Estaciontrabajo[]>) => res)
    );
  }

  getSucursales() {
    return this.http.get(this.getUrlBase() + "/api/Sucursales").pipe(
      map((res: AguilaResponse<Sucursal[]>) => res)
    )
  }

  // ----- ----- ----- ----- Usuario Recurso ----- ----- ----- -----\\
  getRecursosAsignados(idUsuario: number) {
    return this.http.get(this.getUrlBase() + `/api/UsuariosRecursos/${idUsuario}`).pipe(
      map((res: any) => res.aguilaData as RecursoAsignado[]),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getRecursosParametros(pageNumber: number, elementosPagina: number,
    estacionTrabajoId: number, recursoId?: string) {
    return this.http.get(this.urlUsuarioRecurso + `?PageNumber=${pageNumber}&PageSize=${elementosPagina}
      &estacionTrabajo_id=${estacionTrabajoId}&recurso_id=${recursoId}`).pipe(
      tap((res: any) => {
        //this.usuarios = res.aguilaData as Usuario[];
        var pa: number[] = [];
        for (
          let i = res.meta.currentPage - 2;
          i <= res.meta.currentPage + 2;
          i++
        ) {
          if (i > 0 && i <= res.meta.totalPages) {
            pa.push(i);
          }
        }
      }),
      map((res: any) => res.aguilaData as RecursoAsignado[]),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    )
  }

  //Metodo que actualiza las opciones de un recurso asignado
  actualizarRecursoAsignado(recurso: RecursoAsignado) {
    return this.http.put(this.urlUsuarioRecurso + `/${recurso.id}`, recurso).pipe(
      map((res: any) => res.aguilaData as boolean),
      catchError((e) => {
        console.log(e);
        return throwError(e);
      })
    );
  }

  //Metodo que elimina un recurso asignado
  eliminarRecursoAsignado(recursoAsignadoId: number) {
    return this.http.delete(this.urlUsuarioRecurso + `/${recursoAsignadoId}`).pipe(
      map((res: any) => res.aguilaData as boolean),
      catchError((e) => {
        console.log(e);
        return throwError(e);
      })
    );
  }

  //Metodo que asigna un recurso
  asignarRecurso(recurso: RecursoAsignado) {
    return this.http.post(this.urlUsuarioRecurso, recurso).pipe(
      map((res: any) => res.aguilaData as RecursoAsignado),
      catchError((e) => {
        console.log(e);
        return throwError(e);
      })
    );
  }

  //----- ----- ----- ----- Estaciones de Trabajo ----- ----- ----- -----\\

  asignarEstacionTrabajo(estacionTrabajoId: number = null, usuarioId: number = null) {
    let asignacion = {
      "usuarioId": usuarioId,
      "estacionTrabajoId": estacionTrabajoId
    }

    return this.http.post(this.urlAsigEstaciones, asignacion).pipe(
      map((res: any) => res.aguilaData as AsigEstacion),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  eliminarEstacionTrabajo(asignacionId: number) {
    this.sweetService.sweet_carga('Guardando Información');
    return this.http.delete(this.urlAsigEstaciones + `/${asignacionId}`).pipe(
      map((res: any) => res.aguilaData as boolean),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  //Eliminar esta funcion
  getUsuariosEstacionId(estacionTrabajoId?: number, elementosPagina?: number, pageNumber?: number) {
    this.sweetService.sweet_carga('Cargando...');
    return this.http.get(this.urlAsigEstaciones +
      `?EstacionTrabajoId=${estacionTrabajoId}&PageSize=${elementosPagina}&PageNumber=${pageNumber}`).pipe(
        tap((res: any) => {
          //this.usuarios = res.aguilaData as Usuario[];
          var pa: number[] = [];
          for (
            let i = res.meta.currentPage - 2;
            i <= res.meta.currentPage + 2;
            i++
          ) {
            if (i > 0 && i <= res.meta.totalPages) {
              pa.push(i);
            }
          }
        }),
        map((res: any) => res.aguilaData as AsigEstacion[]),
        catchError((e) => {
          console.log(e);
          this.sweetService.sweet_Error(e);
          return throwError(e);
        })
      );
  }

  //----- ----- Asignacion Usuarios Modulos ----- -----\\
  asignarModulo(usuarioId: number, moduloId: number) {
    this.sweetService.sweet_carga('Guardando Información');
    let asignacion = {
      usuarioId: usuarioId,
      moduloId: moduloId
    }
    return this.http.post(this.urlAsigModulos, asignacion).pipe(
      map((res: any) => res.aguilaData),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  eliminarAsignacionModulo(usuarioId: number, moduloId: number) {
    this.sweetService.sweet_carga('Guardando Información');
    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: {
        'usuarioId': usuarioId,
        'moduloId': moduloId
      }
    }

    return this.http.delete(this.urlAsigModulos, options).pipe(
      map((res: any) => res.aguilaData),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }
}
