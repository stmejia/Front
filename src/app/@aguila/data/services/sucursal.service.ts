import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SweetService } from "src/app/@page/services/sweet.service";
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from './config.service';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { Empresa } from "../models/empresa";
import { first, map } from "rxjs/operators";
import { AguilaResponse } from "src/app/@page/models/aguilaResponse";
@Injectable({
  providedIn: "root",
})

export class SucursalService extends ServicioComponente {

  constructor(http: HttpClient, sw: SweetService, modal: MatDialog, cs: ConfigService) {
    super("/api/Sucursales", http, sw, cs, modal);
  }

  getListaEmpresas() {
    return this.getHttp().get(this.urlBase + "/api/Empresas").pipe(
      first(),
      map((response: AguilaResponse<Empresa[]>) => response.aguilaData),
    );
  }  
}
