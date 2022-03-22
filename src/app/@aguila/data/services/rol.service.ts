import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class RolService extends ServicioComponente {

  constructor(http: HttpClient, sw: SweetService, cs: ConfigService) {
    super("/api/Roles", http, sw, cs);
  }
}
