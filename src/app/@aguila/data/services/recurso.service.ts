import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { MatDialog } from '@angular/material/dialog';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class RecursoService extends ServicioComponente {


  constructor(http: HttpClient, sw: SweetService, modal: MatDialog, cs: ConfigService) {
    super("/api/Recursos", http, sw, cs, modal);
  }

}
