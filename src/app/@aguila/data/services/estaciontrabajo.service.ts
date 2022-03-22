import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SweetService } from "src/app/@page/services/sweet.service";
import { ServicioComponente } from "src/app/@page/models/servicioComponente";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "./config.service";
import { first, map } from "rxjs/operators";
import { AguilaResponse } from "src/app/@page/models/aguilaResponse";
import { Sucursal } from "../models/sucursal";

@Injectable({
  providedIn: "root",
})

export class EstaciontrabajoService extends ServicioComponente {
  constructor(http: HttpClient, sw: SweetService, modal: MatDialog, cs: ConfigService) {
    super("/api/EstacionesTrabajo", http, sw, cs, modal);
  }

  getListaSucursales() {
    return this.http.get(this.urlBase + "/api/Sucursales").pipe(first(),
      map((res: AguilaResponse<Sucursal[]>) => res.aguilaData))
  }
}
