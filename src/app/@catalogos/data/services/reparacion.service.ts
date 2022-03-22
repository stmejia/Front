import { Injectable } from '@angular/core';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { MatDialog } from '@angular/material/dialog';
import { first, map } from 'rxjs/operators';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { Lista } from '../models/lista';
@Injectable({
  providedIn: 'root'
})
export class ReparacionService extends ServicioComponente {
  constructor(http: HttpClient, sw: SweetService, cs: ConfigService, modal: MatDialog) {
    super("/api/reparaciones", http, sw, cs, modal);
  }

  getItemsDeLista(campo: string) {
    return this.getHttp().get(this.urlBase + `/api/tiposLista/lista?idRecurso=${this.getRecurso().id}&idEmpresa=${this.getEmpresa().id}&campo=${campo}`)
      .pipe(first(), map((res: AguilaResponse<Lista[]>) => res.aguilaData));
  }
}
