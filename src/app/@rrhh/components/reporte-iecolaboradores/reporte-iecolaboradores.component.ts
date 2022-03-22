import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmpleadosIngresosService } from 'src/app/@controlGarita/data/services/empleados-ingresos.service';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { FiltrosC } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';

@Component({
  selector: 'app-reporte-iecolaboradores',
  templateUrl: './reporte-iecolaboradores.component.html',
  styleUrls: ['./reporte-iecolaboradores.component.css']
})
export class ReporteIEColaboradoresComponent extends BaseComponent<EmpleadosIngresosService> implements OnInit {

  constructor(protected sw: SweetService, protected s: EmpleadosIngresosService, protected r: Router) {
    super("Ingreso / Egreso De Colaboradores", s, sw);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  cargarComponent() {
    this.rutaComponent = this.r.url;
    this.columnasTabla = [
      { titulo: "Nombre", target: [], targetConcatenar: [['empleado', 'nombres'], ['empleado', 'apellidos']], caracterConcatenar: " ", tipo: "concatenar", aligment: "left", visible: true },
      { titulo: "CUI", target: ["cui"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "Movimiento", target: ["evento"], tipo: "texto", aligment: "left", visible: true },
      { titulo: "Vehículo", target: ["vehiculo"], tipo: "texto", aligment: "center", visible: true },
      { titulo: "Fecha", target: ["fechaEvento"], formatoFecha: "DD/MM/YYYY HH:mm:ss", tipo: "fecha", aligment: "left", visible: true },
      { titulo: "Usuario", target: ["usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
    ];
    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    this.filtros.push(
      {
        nombre: "CUI",
        valores: [],
        filters: [{ filtro: "cui", parametro: "" }],
        tipo: "input",
        activo: true,
        requerido: false,
        tipoInput: "string"
      },
      {
        nombre: "Movimiento",
        valores: [
          { nombre: "Ingreso A Predio", valor: "INGRESO" },
          { nombre: "Salida De Predio", valor: "SALIDA" }
        ],
        filters: [{ filtro: "evento", parametro: "" }],
        tipo: "lista",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Rango De Fechas",
        valores: [
          { nombre: "F. Inicio", valor: "" },
          { nombre: "F. Fin", valor: "" }],
        filters: [{ filtro: "fechaInicio", parametro: "" }, { filtro: "fechaFin", parametro: "" }],
        tipo: "rangoFechas",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Hora Movimiento",
        valores: [],
        filters: [{ filtro: "hora", parametro: "" }],
        tipo: "input",
        activo: true,
        requerido: false,
        tipoInput: "time"
      },
      {
        nombre: "Usar Hora De Movimiento Para",
        valores: [{ nombre: "Antes De La Hora", valor: true }, { nombre: "Despues De La Hora", valor: false }],
        filters: [{ filtro: "antesDe", parametro: "" }],
        tipo: "lista",
        activo: true,
        requerido: false,
      },
    );

    let filtroEstaciones: FiltrosC = {
      activo: true,
      nombre: "Predio",
      filters: [{ filtro: "idEstacionTrabajo", parametro: "" }],
      tipo: "lista",
      requerido: true,
      valores: []
    }

    this.s.getUsuarioActual().estacionesTrabajoAsignadas.forEach(estacion => {
      filtroEstaciones.valores.push({ nombre: estacion.estacionTrabajo.nombre, valor: estacion.estacionTrabajoId });
    });
    this.filtros.push(filtroEstaciones);
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

}
