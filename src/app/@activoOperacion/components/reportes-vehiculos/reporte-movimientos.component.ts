import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ControlVehiculosService } from '../../data/services/control-vehiculos.service';

@Component({
  selector: 'app-reporte-movimientos-vehiculos',
  templateUrl: './reporte-movimientos.component.html'
})
export class ReporteMovimientosVehiculosComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];
  private listaEstados: Estados[] = [];

  private columnas: ColumnaTabla[] = [
    { titulo: 'Fecha', target: ["fecha"], tipo: 'fecha', aligment: 'left', visible: true },
    { titulo: 'Código', target: ["activoOperacion", "codigo"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'COC', target: ["activoOperacion", "coc"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Placa', target: ['activoOperacion', 'vehiculo', 'placa'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Transporte', target: ["activoOperacion", "transporte", "nombre"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Tipo Documento', target: ["tipoDocumento"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Documento', target: ["documento"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Estado', target: ["estado", "nombre"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Estación', target: ["estacionTrabajo", "codigo"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Piloto', target: ["piloto", "nombres"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Observaciones', target: ["observaciones"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Usuario', target: ["usuario", "nombre"], tipo: 'texto', aligment: 'left', visible: true },
  ];

  header: ItemHeaderComponent = {
    titulo: 'Movimientos De Vehículos',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  constructor(private serviceComponent: ControlVehiculosService, private sweetService: SweetService,
    private router: Router, private reporteService: ReportesService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(val => val === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.serviceComponent.paginaAnterior();
        break;
    }
  }

  cargarComponent() {
    this.serviceComponent.setConfiguracionComponent({
      header: this.header,
      isModal: false
    });

    this.serviceComponent.setColumnas(this.columnas);
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin([
      this.serviceComponent.getEstados(),
    ]).subscribe(res => {
      this.listaEstados = res[0];
      this.setFiltrosComponent();
    });
  }

  setFiltrosComponent() {
    let tipoEquipo = this.serviceComponent.getTiposVehiculosValue();
    let filtros: FiltrosC[] = [];
    //Filtro Codigo Equipo
    filtros.push({
      activo: true,
      nombre: "Código De Equipo",
      filters: [{ filtro: "codigo", parametro: "" }],
      tipo: "input",
      tipoInput: "string",
      requerido: false,
      valores: []
    });

    //Filtro Tipo Documento
    filtros.push({
      activo: true,
      nombre: "Tipo Documento",
      filters: [{ filtro: "tipoDocumento", parametro: "" }],
      tipo: "input",
      tipoInput: "string",
      requerido: false,
      valores: []
    });

    //Filtro Documento
    filtros.push({
      activo: true,
      nombre: "No. Documento",
      filters: [{ filtro: "documento", parametro: "" }],
      tipo: "input",
      tipoInput: "string",
      requerido: false,
      valores: []
    });

    //Filtro Tipo De Equipo
    let f: FiltrosC = {
      activo: true,
      nombre: "Tipo De Vehículo",
      filters: [{ filtro: "idTipoVehiculo", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [{ nombre: "Todos", valor: "" }]
    }
    tipoEquipo.forEach((t => {
      f.valores.push({ nombre: t.prefijo + "-" + t.descripcion, valor: t.id })
    }));
    filtros.push(f);

    //Filtro Estados
    let fEstados: FiltrosC = {
      activo: true,
      nombre: "Estado",
      filters: [{ filtro: "listaIdEstados", parametro: "" }],
      tipo: "checkbox",
      requerido: false,
      valores: []
    }
    this.listaEstados.forEach((e) => {
      fEstados.valores.push({ nombre: e.nombre, valor: e.id });
    });
    filtros.push(fEstados);

    //Filtro Flota
    filtros.push({
      activo: true,
      nombre: "Flota",
      filters: [{ filtro: "flota", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "GT", valor: "GT" },
        { nombre: "SV", valor: "SV" },
        { nombre: "HN", valor: "HN" }]
    });

    //Filtro Equipo Propio
    filtros.push({
      activo: true,
      nombre: "Equipo Propio",
      filters: [{ filtro: "propio", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "Si", valor: true },
        { nombre: "No", valor: false }]
    });

    //Filtro Equipo Activo
    filtros.push({
      activo: true,
      nombre: "Equipo Activo",
      filters: [{ filtro: "equipoActivo", parametro: true }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "Si", valor: true },
        { nombre: "No", valor: false }]
    });

    //Filtro Predio
    let fEstaciones: FiltrosC = {
      activo: true,
      nombre: "Predio",
      filters: [{ filtro: "idEstacionTrabajo", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
      ]
    }

    this.serviceComponent.getUsuario().estacionesTrabajoAsignadas.forEach(estacion => {
      fEstaciones.valores.push({ nombre: estacion.estacionTrabajo.nombre, valor: estacion.estacionTrabajoId });
    });
    filtros.push(fEstaciones);

    //Filtro Fechas
    filtros.push({
      nombre: "Rango De Fechas",
      valores: [
        { nombre: "F. Inicio", valor: "" },
        { nombre: "F. Fin", valor: "" }],
      filters: [{ filtro: "fechaInicial", parametro: "" }, { filtro: "fechaFinal", parametro: "" }],
      tipo: "rangoFechas",
      activo: true,
      requerido: true,
    });

    this.serviceComponent.setFiltrosComponent(filtros);
    this.queryFilters = [];
    this.cargandoDatos = false;
  }

  cargarPaginaFiltros() {
    this.serviceComponent.cargarReporteMovimientos(this.queryFilters);
  }

  getFiltrosComponent() {
    return this.serviceComponent.getFiltrosComponent();
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    //this.queryFilters.push({ filtro: "idEstacionTrabajo", parametro: this.serviceComponent.getEstacionTrabajo().id });
    //this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
    //this.queryFilters.push({ filtro: "tipoCondicion", parametro: this.tipoCondicion });
    this.serviceComponent.setDatosReporteMovimientos([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
  }

  generarPdf(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Movimientos De Vehículos", bold: true, size: 18 }
      ]
    }
    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }
    this.reporteService.generarPDFTabla(evento.columnas, evento.datos, titulos);
  }

  generarExcel(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Movimientos De Vehículos", bold: true, size: 14 },
      ]
    }

    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }

    this.reporteService.generarExcelTabla(evento.columnas, evento.datos, titulos);
  }

  getSubtituloFiltrosAplicados() {
    let filtrosAplicados = "Filtros Aplicados: ";
    this.queryFilters.forEach((f, i) => {
      if (f.parametro !== "") {
        switch (f.filtro) {
          case "idTipoVehiculo":
            filtrosAplicados += ` -Tipo De Vehiculo: ${this.serviceComponent.getTiposVehiculosValue().find(t => t.id.toString() == f.parametro).prefijo}`;
            break;
          case "flota":
            filtrosAplicados += ` -Flota: ${f.parametro}`;
            break;
          case "propio":
            filtrosAplicados += ` -Equipo Propio: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "idEstacionTrabajo":
            filtrosAplicados += ` -Predio: ${this.serviceComponent.getUsuario().estacionesTrabajoAsignadas.find(es => es.estacionTrabajoId.toString() == f.parametro).estacionTrabajo.nombre}`;
            break;
          case "codigo":
            filtrosAplicados += ` -Código: ${f.parametro}`;
            break;
          case "tipoDocumento":
            filtrosAplicados += ` -Tipo De Documento: ${f.parametro}`;
            break;
          case "documento":
            filtrosAplicados += ` -Documento: ${f.parametro}`;
            break;
        }
      }
    });

    let fEstados = this.queryFilters.find(f => f.filtro == 'listaIdEstados');
    if (fEstados) {
      if (fEstados.parametro != '') {
        if (fEstados.parametro.length > 0) {
          filtrosAplicados += fEstados.parametro.length == 1 ? ' -Estado: ' : ' -Estados: ';
          fEstados.parametro.forEach((elemnt, index) => {
            filtrosAplicados += this.listaEstados.find(es => es.id == elemnt).nombre;
            if (index < (fEstados.parametro.length - 1)) {
              filtrosAplicados += ', '
            }
          });
        }
      }
    }

    if (this.queryFilters.find(f => f.filtro == 'fechaInicial') && this.queryFilters.find(f => f.filtro == 'fechaInicial')) {
      filtrosAplicados += ` -Rango De Fechas: ${moment(this.queryFilters.find(f => f.filtro == 'fechaInicial').parametro).format('DD-MM-YYYY')} al ${moment(this.queryFilters.find(f => f.filtro == 'fechaFinal').parametro).format('DD-MM-YYYY')}`;
    }

    return filtrosAplicados;
  }

  getDatos() {
    return this.serviceComponent.getDatosReporteMovimientos();
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('reporteMovimientos')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("reporteMovimientos");
      this.serviceComponent.paginaAnterior();
    }
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

}
