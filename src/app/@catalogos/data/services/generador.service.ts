import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first, map } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { TipoGenerador } from '../models/tipoGenerador';

@Injectable({
  providedIn: 'root'
})
export class GeneradorService extends ServicioComponente {
  
  constructor(protected sweetService: SweetService, protected http: HttpClient, protected configService: ConfigService,
    protected modal: MatDialog) {
    super("/api/generadores", http, sweetService, configService, modal);
  }

  getTiposGenerador(){
    return this.getHttp().get(this.getUrlBase() + "/api/tipoGeneradores").pipe(first(), 
    map((res:AguilaResponse<TipoGenerador[]>) => res.aguilaData));
  }
}
