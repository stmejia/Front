import { AsigEstacion } from './../../../@aguila/data/models/asigEstacion';
import { Modulo } from './../../../@aguila/data/models/modulo';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-panel-status',
  templateUrl: './panel-status.component.html',
  styleUrls: ['./panel-status.component.css']
})
export class PanelStatusComponent implements OnInit {

  modulo: Modulo;
  estacion: AsigEstacion;
  estado: boolean = false;
  fecha: Date = new Date();
  interval: any;
  tiempoRestante = 0;
  mostrarAlerta: boolean = false;

  constructor(private configService: ConfigService) {
    forkJoin([
      this.configService.getCargando().pipe(first(value => value === false))
    ]).subscribe((res) => { this.cargarDatos() });
  }

  ngOnInit(): void { }

  cargarDatos() {
    this.configService.getEstacionTrabajo().subscribe(res => this.estacion = res);
    this.configService.getModulo().subscribe(res => {
      if (res) {
        this.modulo = res;
        this.estado = true;
      } else {
        this.estado = false;
      }
    });

    let token = this.configService.getToken();
    let fecha = moment();
    let fechaToken = moment(token.exp * 1000);
    this.tiempoRestante = fechaToken.diff(fecha, 'seconds', true);
    if (this.tiempoRestante < 1800) {
      this.mostrarAlerta = true;
    }
    this.interval = setInterval(() => {
      if (this.tiempoRestante > 0) {
        let fecha = moment();
        this.tiempoRestante = fechaToken.diff(fecha, 'seconds', true);
        if (this.tiempoRestante < 1800) {
          this.mostrarAlerta = true;
        }
      } else {
        this.tiempoRestante = 180;
      }
    }, 1200000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  getExpiracion() {
    let token = this.configService.getToken();

    if (token) {
      let fecha = moment();
      let fechaToken = moment(token.exp * 1000);
      return { restante: fechaToken.diff(fecha, 'hours', true).toFixed(2) + " horas aproximadamente", vence: fechaToken.format(" hh:mm a") }
    } else {
      return { restante: 'Calculando...', vence: 'Calculando...' }
    }
  }

  getIconoModulo() {
    return this.configService.getIconoModulo(this.configService.getModuloValue().path);
  }
}
