import { Component, OnInit } from '@angular/core';
import { ECharts } from 'echarts';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { Vehiculo } from 'src/app/@catalogos/data/models/vehiculo';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ControlVehiculosService } from '../../data/services/control-vehiculos.service';

@Component({
  selector: 'app-reportes-vehiculos',
  templateUrl: './reportes-vehiculos.component.html',
  styleUrls: ['./reportes-vehiculos.component.css']
})
export class ReportesVehiculosComponent implements OnInit {

  //Fecha-Tipo-Lugar-Estado
  cargandoDatos: boolean = true;
  private queryFilters: QueryFilter[] = [];
  private listaEstados: Estados[] = [];
  mostrarGraficas: boolean = false;
  private listaDatos: Vehiculo[] = [];
  private columnasDefault: ColumnaTabla[] = [
    //{ titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'Código', target: ["activoOperacion", "codigo"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'COC', target: ["activoOperacion", "coc"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Placa', target: ['placa'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Transporte', target: ["activoOperacion", "transporte", "nombre"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Lugar', target: ['activoOperacion', 'movimientoActual', 'lugar'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'Estado', target: ['activoOperacion', 'movimientoActual', 'estado', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Disponible', target: ['activoOperacion', 'movimientoActual', 'estado', 'disponible'], tipo: 'boolean', aligment: 'center', visible: true },
    { titulo: "Dias S/Mov.", target: ["activoOperacion", "movimientoActual", "vDiasUltMov"], tipo: "texto", aligment: "right", visible: true },
    { titulo: "F. U/Mov.", target: ["activoOperacion", "movimientoActual", "fecha"], tipo: "fecha", aligment: "right", visible: true },
    { titulo: 'U. Servicio', target: ['activoOperacion', 'movimientoActual', 'servicio', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'U. Ruta', target: ['activoOperacion', 'movimientoActual', 'ruta', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: "Piloto", target: ["activoOperacion", "movimientoActual", "empleado", "nombres"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["activoOperacion", "movimientoActual", "usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
  ];

  //Graficas Nuevas
  optionsEquiposPorEstado = { //Pie Chart
    title: {
      text: 'Equipos Por Estado',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: []
    },
    calculable: true,
    series: [
      {
        name: 'Estado',
        type: 'pie',
        radius: [25, 100],
        roseType: 'area',
        data: []
      }
    ]
  };

  optionsEquiposPorEstacion = { //Pie Chart
    title: {
      text: 'Equipos Por Predio',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: []
    },
    calculable: true,
    series: [
      {
        name: 'Equipos',
        type: 'pie',
        radius: [25, 100],
        roseType: 'area',
        data: []
      }
    ]
  };

  optionsEquiposPorEstadoEstacion = { //Bar Chart
    title: {
      text: 'Estado De Equipos',
      subtext: 'Por Estación De Trabajo',
      x: 'center'
    },
    legend: {
      data: [], //Oficinas / Estaciones De Trabajo
      x: 'center',
      y: 'bottom',
    },
    tooltip: {},
    xAxis: {
      data: [], //Estados
      silent: false,
      splitLine: {
        show: false,
      },
    },
    yAxis: {},
    series: [], //Oficinas / Estaciones De Trabajo,
    animationEasing: 'elasticOut',
    animationDelayUpdate: (idx) => idx * 5,
  };

  optionsEquiposPorTipo = { //barChart
    title: {
      text: 'Estado De Equipos',
      subtext: 'Por Tipo De Equipo',
      x: 'center'
    },
    legend: {
      data: [], //Oficinas / Estaciones De Trabajo
      x: 'center',
      y: 'bottom',
    },
    tooltip: {},
    xAxis: {
      data: [], //Estados
      silent: false,
      splitLine: {
        show: false,
      },
    },
    yAxis: {},
    series: [ //Oficinas / Estaciones De Trabajo
    ],
    animationEasing: 'elasticOut',
    animationDelayUpdate: (idx) => idx * 5,
  };

  constructor(private serviceComponent: ControlVehiculosService, private sweetService: SweetService,
    private reporteService: ReportesService) {
  }

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

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        //this.router.navigate([this.rutaComponent, event.objeto.idActivo]);
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Reportes')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Reportes");
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    this.serviceComponent.setConfiguracionComponent({
      header: {
        titulo: 'Inventario De Vehículos',
        opciones: [
          {
            icono: 'clear', nombre: 'Regresar', disponible: true,
            idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
          }
        ]
      },
      isModal: false,
    });

    this.serviceComponent.setColumnas(this.columnasDefault);
    this.serviceComponent.setMenuOpcionesTabla([
      { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
      { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
    ]);
    this.cargarDatos();
  }

  cargarDatos() {
    this.serviceComponent.getEstados().subscribe(res => {
      this.listaEstados = res;
      this.setFiltrosComponent();
    });

    this.getDatos().subscribe(res => { this.generarDataGraficas(res) });
  }

  setFiltrosComponent() {
    let tipoVehiculos = this.serviceComponent.getTiposVehiculosValue();
    let filtros: FiltrosC[] = [];
    let f: FiltrosC = {
      activo: true,
      nombre: "Tipo De Vehículo",
      filters: [{ filtro: "idTipoVehiculo", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [{ nombre: "Todos", valor: "" }]
    }
    tipoVehiculos.forEach((t => {
      f.valores.push({ nombre: t.prefijo + "-" + t.descripcion, valor: t.id })
    }));
    filtros.push(f);
    let fEstados: FiltrosC = {
      activo: true,
      nombre: "Estado",
      filters: [{ filtro: "idEstado", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [{ nombre: "Todos", valor: "" }]
    }
    this.listaEstados.forEach((e) => {
      fEstados.valores.push({ nombre: e.nombre, valor: e.id });
    });
    filtros.push(fEstados);
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
    filtros.push({
      activo: true,
      nombre: "Equipo Activo",
      filters: [{ filtro: "equipoActivo", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [
        { nombre: "Todos", valor: "" },
        { nombre: "Si", valor: true },
        { nombre: "No", valor: false }]
    });
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
    this.serviceComponent.setFiltrosComponent(filtros);
    this.cargandoDatos = false;
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    this.serviceComponent.setDatosReporte([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.");
    this.mostrarGraficas = false;
  }

  cargarPagina(noPagina: number) {
    this.queryFilters.forEach((f, i) => {
      if (f.filtro == "PageNumber") {
        this.queryFilters[i].parametro = noPagina;
      }
    });
    this.serviceComponent.cargarPaginaReportes(this.queryFilters);
  }

  generarDataGraficas(data) {
    this.listaDatos = data;
    /*
    Limpiamos las variables
    */
    this.optionsEquiposPorEstado.legend.data = [];
    this.optionsEquiposPorEstado.series[0].data = [];
    this.optionsEquiposPorEstacion.legend.data = [];
    this.optionsEquiposPorEstacion.series[0].data = [];
    this.optionsEquiposPorEstadoEstacion.legend.data = [];
    this.optionsEquiposPorEstadoEstacion.xAxis.data = [];
    this.optionsEquiposPorEstadoEstacion.series = [];
    this.optionsEquiposPorTipo.legend.data = [];
    this.optionsEquiposPorTipo.xAxis.data = [];
    this.optionsEquiposPorTipo.series = [];

    let labelsEstado: string[] = [];

    let { datos: datosXEstado } = this.getDatosXEstados();
    let datosXEstacionTrabajo = this.getDatosXEstacionTrabajo();
    let datosXEquipo = this.getDatosXEquipos();

    for (let estado in datosXEstado) {
      this.optionsEquiposPorEstado.series[0].data.push({ value: datosXEstado[estado], name: estado });
      labelsEstado.push(estado);
    }

    this.optionsEquiposPorEstado.legend.data = labelsEstado;
    this.optionsEquiposPorEstadoEstacion.xAxis.data = labelsEstado;

    for (let estacion in datosXEstacionTrabajo.datos) {
      this.optionsEquiposPorEstacion.legend.data.push(estacion);
      this.optionsEquiposPorEstacion.series[0].data.push({ value: datosXEstacionTrabajo.datos[estacion], name: estacion });
      this.optionsEquiposPorEstadoEstacion.legend.data.push(estacion);
      let dataSeries: any = {
        name: estacion,
        type: 'bar',
        data: [],
        animationDelay: (idx) => idx * 10,
      };
      labelsEstado.forEach(estado => {
        let noItemsEstado = this.listaDatos.filter(equipo => (equipo.activoOperacion.movimientoActual.estacionTrabajo.nombre.toUpperCase().trim() == estacion)
          && (equipo.activoOperacion.movimientoActual.estado.nombre.toUpperCase().trim() == estado)).length;
        dataSeries.data.push(noItemsEstado);
      });
      this.optionsEquiposPorEstadoEstacion.series.push(dataSeries);
    }

    this.optionsEquiposPorTipo.xAxis.data = labelsEstado;

    for (let tipo in datosXEquipo.datos) {
      this.optionsEquiposPorTipo.legend.data.push(tipo);
      let dataSeries: any = {
        name: tipo,
        type: 'bar',
        data: [],
        animationDelay: (idx) => idx * 10,
      };
      labelsEstado.forEach(estado => {
        let noItemsEstado = this.listaDatos.filter(equipo => (equipo.tipoVehiculos.prefijo.toUpperCase().trim() == tipo)
          && (equipo.activoOperacion.movimientoActual.estado.nombre.toUpperCase().trim() == estado)).length;
        dataSeries.data.push(noItemsEstado);
      });
      this.optionsEquiposPorTipo.series.push(dataSeries);
    }
    this.mostrarGraficas = true;
  }

  generarPdf(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Inventario De Vehículos", bold: true, size: 18 }
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
        { text: "Inventario De Vehículos", bold: true, size: 14 },
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
          case "equipoActivo":
            filtrosAplicados += ` -Equipo Activo: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "idEstado":
            filtrosAplicados += ` -Estado: ${this.listaEstados.find(t => t.id.toString() == f.parametro).nombre}`;
            break;
          case "idEstacionTrabajo":
            filtrosAplicados += ` -Predio: ${this.serviceComponent.getUsuario().estacionesTrabajoAsignadas.find(es => es.estacionTrabajoId.toString() == f.parametro).estacionTrabajo.nombre}`;
            break;
          default:
            break;
        }
      }
    });

    return filtrosAplicados;
  }

  cargarPaginaFiltros() {
    this.serviceComponent.cargarPaginaReportes(this.queryFilters);
  }

  getFiltrosComponent() {
    return this.serviceComponent.getFiltrosComponent();
  }

  getTipoVehiculos() {
    return this.serviceComponent.getTiposVehiculos();
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  getDatos() {
    return this.serviceComponent.getDatosReporte();
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  getMenuOpcionesTabla() {
    return this.serviceComponent.getMenuOpcionesTabla();
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

  getDatosXEstado(evento: string) {
    return this.listaDatos.filter(i => i.activoOperacion.movimientoActual.estado.evento.toLowerCase().includes(evento) ? true : false);
  }

  getEquiposDisponibles() {
    return this.listaDatos.filter(i => i.activoOperacion.movimientoActual.estado.disponible == true);
  }

  getDatosXEstados() {
    let datosR: any = {};
    let noItems = 0;

    this.listaDatos.forEach(equipo => {
      let estado = equipo.activoOperacion.movimientoActual.estado.nombre.toUpperCase().trim();
      datosR[estado] = (datosR[estado] || 0) + 1;
    });

    for (let item in datosR) {
      noItems += datosR[item];
    }

    return { datos: datosR, totalDatos: noItems };
  }

  getDatosXEstacionTrabajo() {
    let datosR: any = {};
    let noItems = 0;

    this.listaDatos.forEach(equipo => {
      let estacion = equipo.activoOperacion.movimientoActual.estacionTrabajo.nombre.toUpperCase().trim();
      datosR[estacion] = (datosR[estacion] || 0) + 1;
    });

    for (let item in datosR) {
      noItems += datosR[item];
    }

    return { datos: datosR, totalDatos: noItems };
  }

  getDatosXEquipos() {
    let datosR: any = {};
    let noItems = 0;

    this.listaDatos.forEach(equipo => {
      let tpEquipo = equipo.tipoVehiculos.prefijo.toUpperCase().trim();
      datosR[tpEquipo] = (datosR[tpEquipo] || 0) + 1;
    });

    for (let item in datosR) {
      noItems += datosR[item];
    }

    return { datos: datosR, totalDatos: noItems };
  }
}
