import { SweetService } from './../../../@page/services/sweet.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';

@Injectable({
  providedIn: "root",
})

export class EmpresaService extends ServicioComponente {

  constructor(protected http: HttpClient, protected sw: SweetService, protected modal: MatDialog, protected cs: ConfigService) {
    super("/api/Empresas", http, sw, cs, modal);
  }
}