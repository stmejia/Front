import { Injectable } from '@angular/core';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { first, map } from 'rxjs/operators';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { Pais } from '../models/pais';
import { Observable } from 'rxjs';
import { Departamento } from '../models/departamento';
import { CodigoPostal, Municipio } from '../models/municipio';

@Injectable({
  providedIn: 'root'
})
export class DireccionService extends ServicioComponente {

  constructor(protected http: HttpClient, protected sw: SweetService, protected cs: ConfigService) {
    super("/api/direcciones", http, sw, cs);
  }

  getListaPaises(): Observable<Pais[]> {
    return this.getHttp().get(this.urlBase + "/api/Paises?PageSize=999")
      .pipe(first(), map((res: AguilaResponse<Pais[]>) => res.aguilaData));
  }

  getListaDepartamentos(idPais): Observable<Departamento[]> {
    return this.getHttp().get(this.urlBase + `/api/departamentos?idPais=${idPais}&PageSize=999`)
      .pipe(first(), map((res: AguilaResponse<Departamento[]>) => res.aguilaData));
  }

  getListaMunicipios(idDepartamento): Observable<Municipio[]> {
    return this.getHttp().get(this.urlBase + `/api/municipios?idDepartamento=${idDepartamento}&PageSize=999`)
      .pipe(first(), map((res: AguilaResponse<Municipio[]>) => res.aguilaData));
  }

  getCodigoPostal(idMunicipio): Observable<CodigoPostal> {
    return this.getHttp().get(this.urlBase + `/api/codigoPostal/${idMunicipio}`)
      .pipe(first(), map((res: AguilaResponse<CodigoPostal>) => res.aguilaData));
  }
}
