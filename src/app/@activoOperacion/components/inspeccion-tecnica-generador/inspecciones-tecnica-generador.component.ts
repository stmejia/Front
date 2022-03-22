import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { CondicionGeneradorService } from '../../data/services/condicion-generador.service';
import { CondicionTecnicaGeneradorService } from '../../data/services/condicion-tecnica-generador.service';

@Component({
  selector: 'app-inspecciones-tecnica-generador',
  templateUrl: './inspecciones-tecnica-generador.component.html',
  styleUrls: ['./inspecciones-tecnica-generador.component.css']
})
export class InspeccionesTecnicaGeneradorComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];

  private columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    //{ titulo: "Tipo Condición", target: ["condicionActivo", "movimiento"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "CUI", target: ["condicionActivo", "activoOperacion", "codigo"], tipo: "texto", aligment: "left", visible: true },
    //{ titulo: "Placa", target: ["condicionActivo", "placa"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Piloto", target: ["condicionActivo", "empleado", "nombres"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Inspec. en Orden", target: ["condicionActivo", "inspecVeriOrden"], tipo: "boolean", aligment: "center", visible: true },
    { titulo: "Disponible", target: ["condicionActivo", "disponible"], tipo: "boolean", aligment: "center", visible: true },
    { titulo: "Observaciones", target: ["condicionActivo", "observaciones"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Fecha", target: ["condicionActivo", "fecha"], tipo: "fecha", aligment: "left", visible: true },
  ];

  constructor(private serviceComponent: CondicionTecnicaGeneradorService, private sweetService: SweetService,
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
      case 2:
        this.router.navigate([this.rutaComponent, '']);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.serviceComponent.imprimirCondicion(event.objeto.idCondicionActivo);
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    this.rutaComponent = this.router.url;
    this.serviceComponent.setConfiguracionComponent({
      header: {
        titulo: 'Inspecciones De Generadores',
        opciones: [
          {
            icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
            idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
          }
        ]
      },
      isModal: false,
    });

    this.serviceComponent.setColumnas(this.columnas);
    this.serviceComponent.setMenuOpcionesTabla([
      { icono: 'print', nombre: 'Imprimir', disponible: this.opcionDisponible('Imprimir'), idEvento: 1 },
    ]);
    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    let filtros: FiltrosC[] = [
      {
        nombre: "Disponible",
        valores: [
          { nombre: "Todos", valor: "" },
          { nombre: "Si", valor: true },
          { nombre: "No", valor: false }],
        filters: [{ filtro: "disponible", parametro: "" }],
        tipo: "lista",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Verificación En Orden",
        valores: [
          { nombre: "Todos", valor: "" },
          { nombre: "Si", valor: true },
          { nombre: "No", valor: false }],
        filters: [{ filtro: "inspecVeriOrden", parametro: "" }],
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
        requerido: true,
      }
    ]

    this.serviceComponent.setFiltrosComponent(filtros);
    this.queryFilters = [];
    this.cargandoDatos = false;
  }

  getFiltrosComponent() {
    return this.serviceComponent.getFiltrosComponent();
  }

  cargarPagina(noPagina: number) {
    this.queryFilters.forEach((f, i) => {
      if (f.filtro == "PageNumber") {
        this.queryFilters[i].parametro = noPagina;
      }
    });

    this.serviceComponent.cargarPagina(this.queryFilters);
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
          case "disponible":
            filtrosAplicados += ` -Equipo Disponible: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "inspecVeriOrden":
            filtrosAplicados += ` -Verificación En Orden: ${f.parametro ? 'Si' : 'No'}`;
            break;
        }
      }
    });
    filtrosAplicados += ` -Rango De Fechas: ${moment(this.queryFilters.find(f => f.filtro == 'fechaInicio').parametro).format('DD-MM-YYYY')} al ${moment(this.queryFilters.find(f => f.filtro == 'fechaFin').parametro).format('DD-MM-YYYY')}`;
    return filtrosAplicados;
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  cargarPaginaFiltros() {
    this.serviceComponent.cargarPagina(this.queryFilters);
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    this.queryFilters.push({ filtro: "idEstacionTrabajo", parametro: this.serviceComponent.getEstacionTrabajo().id });
    this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
    this.serviceComponent.setDatos([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

  getMenuOpcionesTabla() {
    return this.serviceComponent.getMenuOpcionesTabla();
  }

  getDatos() {
    return this.serviceComponent.getDatos();
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

}
