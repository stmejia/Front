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
import { CondicionGeneradorService } from '../../data/services/condicion-generador.service';

@Component({
  selector: 'app-reporte-inspeccion-generador',
  templateUrl: './reporte-inspeccion-generador.component.html',
  styleUrls: ['./reporte-inspeccion-generador.component.css']
})
export class ReporteInspeccionGeneradorComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];
  private listaEstados: Estados[] = [];

  private columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'Predio', target: ['estacionTrabajo', 'codigo'], tipo: 'texto' ,aligment: 'center', visible: true },
    { titulo: "Tipo Condición", target: ["movimiento"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "CUI", target: ["activoOperacion", "codigo"], tipo: "texto", aligment: "left", visible: true },
    //{ titulo: "Placa", target: ["condicionActivo", "placa"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Piloto", target: ["empleado", "nombres"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Estado", target: ["estado", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Inspec. en Orden", target: ["inspecVeriOrden"], tipo: "boolean", aligment: "center", visible: true },
    { titulo: "Disponible", target: ["disponible"], tipo: "boolean", aligment: "center", visible: true },
    { titulo: "Observaciones", target: ["observaciones"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Fecha", target: ["fecha"], tipo: "fecha", aligment: "left", visible: true },
  ];

  header: ItemHeaderComponent = {
    titulo: 'Reporte De Inspecciones',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }
  
  constructor(private serviceComponent: CondicionGeneradorService, private sweetService: SweetService,
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
      this.serviceComponent.getEstadosCondiciones(),
    ]).subscribe(res => {
      this.listaEstados = res[0];
      this.setFiltrosComponent();
    });
  }

  setFiltrosComponent() {
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
      nombre: "Tipo Inspección",
      filters: [{ filtro: "movimiento", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "Ingreso", valor: "ingreso" },
        { nombre: "Salida", valor: "salida" }
      ]
    });

    //Filtro Estados
    let fEstados: FiltrosC = {
      activo: true,
      nombre: "Estados",
      filters: [{ filtro: "listaIdEstados", parametro: "" }],
      tipo: "checkbox",
      requerido: false,
      valores: []
    }
    this.listaEstados.forEach((e) => {
      fEstados.valores.push({ nombre: e.nombre, valor: e.id });
    });
    filtros.push(fEstados);

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
      filters: [{ filtro: "fechaInicio", parametro: "" }, { filtro: "fechaFin", parametro: "" }],
      tipo: "rangoFechas",
      activo: true,
      requerido: true,
    });

    this.serviceComponent.setFiltrosComponent(filtros);
    this.queryFilters = [];
    this.cargandoDatos = false;
  }

  cargarPaginaFiltros() {
    this.serviceComponent.cargarReporteInspecciones(this.queryFilters);
  }

  getFiltrosComponent() {
    return this.serviceComponent.getFiltrosComponent();
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    this.serviceComponent.setDatosReporteInspecciones([]);
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
        { text: "Inspecciones De Generador", bold: true, size: 18 }
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
        { text: "Inspecciones De Generador", bold: true, size: 14 },
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
          case "idEstacionTrabajo":
            filtrosAplicados += ` -Predio: ${this.serviceComponent.getUsuario().estacionesTrabajoAsignadas.find(es => es.estacionTrabajoId.toString() == f.parametro).estacionTrabajo.nombre}`;
            break;
          case "codigo":
            filtrosAplicados += ` -Código: ${f.parametro}`;
            break;
          case "movimiento":
            filtrosAplicados += ` -Tipo De Inspección: ${f.parametro}`;
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
    return this.serviceComponent.getDatosReporteInspecciones();
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('reporteInspecciones')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }
}
