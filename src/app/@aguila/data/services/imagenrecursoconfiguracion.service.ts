import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, first } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { Recurso } from '../models/recurso';
import { ConfigService } from './config.service';
import { MatDialog } from '@angular/material/dialog';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';

@Injectable({
  providedIn: 'root'
})
export class ImagenrecursoconfiguracionService extends ServicioComponente {

  private urlEndPointRecursos = environment.UrlAguilaApi + "/api/Recursos";

  constructor(http: HttpClient, sw: SweetService, modal: MatDialog, cs: ConfigService) {
    super("/api/ImagenesRecursosConfiguracion", http, sw, cs, modal)
  }


  getRecursoXControlador(controlador) {
    return this.http.get(this.urlEndPointRecursos + "?controlador=" + controlador).pipe(
      first(),
      map((res: any) => res.aguilaData as Recurso[]),
      catchError((e) => {
        return throwError(e);
      })
    );
  }

  getRecursoId(id) {
    return this.http.get(this.urlEndPointRecursos + "/" + id).pipe(
      first(),
      map((res: any) => res.aguilaData as Recurso),
      catchError((e) => {
        return throwError(e);
      })
    );
  }

}
