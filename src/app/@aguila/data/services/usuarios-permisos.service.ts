import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { AtributoAsig, RecursoAsignado } from '../models/asigAtributo';
import { AsigEstacion } from '../models/asigEstacion';
import { AsigModulo } from '../models/asigModulo';
import { Estaciontrabajo } from '../models/estaciontrabajo';
import { Modulo } from '../models/modulo';
import { Recurso } from '../models/recurso';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosPermisosService extends ServicioComponente {

  constructor(protected http: HttpClient, protected sw: SweetService, protected cs: ConfigService) {
    super("/api/Usuarios", http, sw, cs);
  }

  //Funciones Para Asignacion De Modulos
  //----- ----- -----
  getModulos() {
    return this.http.get(this.getUrlBase() + "/api/Modulos").pipe(
      first(), map((res: AguilaResponse<Modulo[]>) => res)
    );
  }

  getModulosAsignados(idUsuario) {
    return this.http.get(this.getUrlBase() + "/api/AsigUsuariosModulos/" + idUsuario).pipe(
      first(), map((res: AguilaResponse<AsigModulo[]>) => res)
    );
  }

  asignarModulo(data) {
    return this.http.post(this.getUrlBase() + "/api/AsigUsuariosModulos", data).pipe(first());
  }

  desasignarModulo(data) {
    return this.http.delete(this.getUrlBase() + "/api/AsigUsuariosModulos/", data).pipe(first());
  }

  //Funciones Para Asignacion De Modulos
  //----- ----- -----
  getEstacionesDeTrabajo() {
    return this.http.get(this.getUrlBase() + "/api/EstacionesTrabajo/").pipe(first(),
      map((res: AguilaResponse<Estaciontrabajo[]>) => res));
  }

  getEstacionesDeTrabajoAsignadas(idUsuario) {
    return this.http.get(this.getUrlBase() + "/api/AsigUsuariosEstaciones/" + idUsuario).pipe(first(),
      map((res: AguilaResponse<AsigEstacion[]>) => res));
  }

  asignarEstacionDeTrabajo(data) {
    return this.http.post(this.getUrlBase() + "/api/AsigUsuariosEstaciones/", data).pipe(first());
  }

  desasignarEstacionDeTrabajo(id) {
    return this.http.delete(this.getUrlBase() + "/api/AsigUsuariosEstaciones/" + id).pipe(first());
  }

  //Recursos
  //----- ----- -----
  getRecursos() {
    return this.http.get(this.getUrlBase() + "/api/Recursos/general").pipe(first(),
      map((res: AguilaResponse<Recurso[]>) => res));
  }

  getRecusosAsignados(idUsuario) {
    return this.http.get(this.getUrlBase() + "/api/UsuariosRecursos/" + idUsuario).pipe(
      first(), map((res: AguilaResponse<AtributoAsig[]>) => res)
    );
  }

  actualizarPermiso(usuarioRecurso: RecursoAsignado) {
    return this.http.put(this.getUrlBase() + "/api/UsuariosRecursos/" + usuarioRecurso.id, usuarioRecurso).pipe(first());
  }

  asignarPermiso(usuarioRecurso: RecursoAsignado) {
    return this.http.post(this.getUrlBase() + "/api/UsuariosRecursos/", usuarioRecurso).pipe(first(),
      map((res: AguilaResponse<AtributoAsig>) => res));
  }

  eliminarRecursoAsignado(idRecursoAsignado) {
    return this.http.delete(this.getUrlBase() + "/api/UsuariosRecursos/" + idRecursoAsignado).pipe(first())
  }


}
