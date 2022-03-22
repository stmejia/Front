import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { EmpleadoService } from 'src/app/@catalogos/data/services/empleado.service';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { COP } from 'src/app/@page/models/cop';
import { FiltrosC } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';

@Component({
  selector: 'app-reporte-ausencias',
  templateUrl: './reporte-ausencias.component.html',
  styleUrls: ['./reporte-ausencias.component.css']
})
export class ReporteAusenciasComponent extends BaseComponent<EmpleadoService> implements OnInit {

  cop: COP = null;

  constructor(protected sw: SweetService, protected s: EmpleadoService, protected r: Router) {
    super("Ausencia De Colaboradores", s, sw)
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  cargarComponent(): void {
    this.rutaComponent = this.r.url;
    this.columnasTabla = [
      { titulo: 'CUI', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Nombres', target: ['nombres'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Apellidos', target: ['apellidos'], tipo: 'texto', aligment: 'left', visible: true },
    ];

    forkJoin([
      this.s.getListaCops()
    ]).pipe(first()).subscribe(res => {
      this.cop = res[0];
      this.setFiltrosComponent();
    }, (error) => {
      console.log(error);
      this.sw.sweet_notificacion("La pantalla presenta errores " + error, 5000, 'error');
      this.setFiltrosComponent();
    })
  }

  setFiltrosComponent() {
    let filtroUnidadDeNegocio: FiltrosC = {
      activo: true,
      nombre: "Unidad De Negocio",
      filters: [{ filtro: "idEmpresa", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: []
    }
    this.s.getEmpresasAsignadasValue().forEach(empresa => {
      filtroUnidadDeNegocio.valores.push({ nombre: empresa.nombre, valor: empresa.id });
    });

    let filtroLocalidad: FiltrosC = {
      activo: true,
      nombre: "Localidad",
      filters: [{ filtro: "localidad", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: []
    }
    this.getCasillaCop("localidades").forEach(cop => {
      filtroLocalidad.valores.push({ nombre: cop.nombre, valor: cop.codigo });
    });

    let filtroEstaciones: FiltrosC = {
      activo: true,
      nombre: "Predio",
      filters: [{ filtro: "idEstacionTrabajo", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: []
    }

    this.s.getUsuarioActual().estacionesTrabajoAsignadas.forEach(estacion => {
      filtroEstaciones.valores.push({ nombre: estacion.estacionTrabajo.nombre, valor: estacion.estacionTrabajoId });
    });

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
        ],
        filters: [{ filtro: "evento", parametro: "INGRESO" }],
        tipo: "lista",
        activo: false,
        requerido: true,
      },
      {
        nombre: "Fecha",
        valores: [],
        filters: [{ filtro: "fecha", parametro: "" }],
        tipo: "fecha",
        activo: true,
        requerido: false,
      },
      filtroUnidadDeNegocio,
      filtroLocalidad,
      filtroEstaciones
    );

    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

  getCasillaCop(casilla: string): any[] {
    return this.cop[casilla]
  }

  cargarPaginaFiltros(): void {
    this.s.cargarPaginaAusencias(this.queryFilters);
  }
}
