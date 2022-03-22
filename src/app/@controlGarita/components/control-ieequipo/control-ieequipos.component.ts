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
import { ControlIEEquipoService } from '../../data/services/control-ieequipo.service';

@Component({
  selector: 'app-control-ieequipos',
  templateUrl: './control-ieequipos.component.html',
  styleUrls: ['./control-ieequipos.component.css']
})
export class ControlIEEquiposComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];

  private columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: "Piloto", target: ["nombrePiloto"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Cabezal", target: ["placaCabezal"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Equipo", target: ["codigoEquipo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Tipo Equipo", target: ["tipoEquipo"], tipo: "texto", aligment: "center", visible: true },
    { titulo: "Chasis", target: ["codigoChasis"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Generador", target: ["codigoGenerador"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Ingreso", target: ["ingreso"], tipo: "fecha", formatoFecha: "DD/MM/YYYY HH:mm:ss", aligment: "left", visible: true },
    { titulo: "Salida", target: ["salida"], tipo: "fecha", formatoFecha: "DD/MM/YYYY HH:mm:ss", aligment: "left", visible: true },
    { titulo: "LLeno", target: ["cargado"], tipo: "boolean", aligment: "left", visible: true },
    { titulo: "Origen/Destino", target: ["origen"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Marchamo", target: ["marchamo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "ATC", target: ["empresa"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
  ];

  constructor(private service: ControlIEEquipoService, private sweetService: SweetService,
    private reporteService: ReportesService, private router: Router) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(val => val === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    }, (error) => {
      console.log(error);
      this.service.paginaAnterior();
      this.sweetService.sweet_alerta("Error", "No es posible cargar el comonente", "error");
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.router.navigate([this.rutaComponent, '']);
        break;
      case 2:
        //this.marcarSalida(null);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 2:
        this.cambiarFechaIngreso(event.objeto);
        break;
      case 3:
        this.cambiarFechaSalida(event.objeto);
        break;
    }
  }

  eventoPaginador(evento: EventoPaginador) {
    this.queryFilters.forEach(f => {
      if (f.filtro == "PageNumber") {
        f.parametro = evento.noPagina;
      }
    });
    this.cargarPaginaFiltros();
  }

  cargarComponent() {
    this.rutaComponent = this.router.url;
    this.service.setConfiguracionComponent({
      header: {
        titulo: 'Control De Ingresos Y Egresos De Equipo Intermodal',
        opciones: [
          {
            icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
            idEvento: 1, toolTip: 'Agregar registro nuevo', color: 'primary'
          },
        ]
      },
      isModal: false,
    });

    this.service.setMenuOpcionesTabla([
      { icono: 'edit_calendar', nombre: "Cambiar Fecha De Ingreso", disponible: this.opcionDisponible("Fecha De Ingreso"), idEvento: 2 },
      { icono: 'edit_calendar', nombre: "Cambiar Fecha De Salida", disponible: this.opcionDisponible("Fecha De Salida"), idEvento: 3 }
    ]);

    this.service.setColumnas(this.columnas);

    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    let filtros: FiltrosC[] = [
      {
        nombre: "Nombre",
        valores: [],
        filters: [{ filtro: "nombrePiloto", parametro: "" }],
        tipo: "input",
        tipoInput: "string",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Empresa",
        valores: [{ nombre: "CLT", valor: "CLT" }, { nombre: "SYT", valor: "SYT" }],
        filters: [{ filtro: "empresa", parametro: "" }],
        tipo: "lista",
        activo: true,
        requerido: true,
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
      }
    ]

    this.service.setFiltrosComponent(filtros);
    this.queryFilters = [];
    this.cargandoDatos = false;
  }

  getFiltrosComponent() {
    return this.service.getFiltrosComponent();
  }

  cargarPaginaFiltros() {
    this.service.cargarPagina(this.queryFilters);
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    this.queryFilters.push({ filtro: "idEstacionTrabajo", parametro: this.service.getEstacionTrabajo().id });
    this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
    this.service.setDatos([]);
    this.service.setPaginador(null);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
  }

  generarPdf(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.queryFilters.find(f => f.parametro == "CLT") ? "COMPANIA DE LOGISTICA Y TRANSPORTE, S.A." : this.queryFilters.find(f => f.parametro == "SYT") ? "SERVICIOS Y TERMINALES S.A." : this.service.getEmpresa().nombre,
        bold: true,
        size: 18
      },
      subTitulos: [
        { text: "FOR-TT-SF-01", bold: true, size: 10 },
        { text: "REPORTE DE INGRESO Y EGRESO DE EQUIPO INTERMODAL", bold: true, size: 16 }
      ]
    }
    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }
    let ruta = this.queryFilters.find(f => f.parametro == "CLT") ? "./assets/img/clt_logo.png" : this.queryFilters.find(f => f.parametro == "SYT") ? "./assets/img/syt_logo.png" : "";
    this.reporteService.generarPDFTabla(evento.columnas, evento.datos, titulos, ruta);
  }

  generarExcel(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.queryFilters.find(f => f.parametro == "CLT") ? "COMPANIA DE LOGISTICA Y TRANSPORTE, S.A." : this.queryFilters.find(f => f.parametro == "SYT") ? "SERVICIOS Y TERMINALES S.A." : this.service.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "FOR-TT-SF-01", bold: true, size: 10 },
        { text: "REPORTE DE INGRESO Y EGRESO DE EQUIPO INTERMODAL", bold: true, size: 16 }
      ]
    }

    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }
    let ruta = this.queryFilters.find(f => f.parametro == "CLT") ? "./assets/img/clt_logo.png" : this.queryFilters.find(f => f.parametro == "SYT") ? "./assets/img/syt_logo.png" : "";

    this.reporteService.generarExcelTabla(evento.columnas, evento.datos, titulos, ruta);
  }

  getSubtituloFiltrosAplicados() {
    let filtrosAplicados = "Filtros Aplicados: ";
    this.queryFilters.forEach((f, i) => {
      if (f.parametro !== "") {
        switch (f.filtro) {
          case "nombrePiloto":
            filtrosAplicados += ` -Nombre: ${f.parametro}`;
            break;
          case "empresa":
            filtrosAplicados += ` -Empresa: ${f.parametro}`;
            break;
        }
      }
    });
    if (this.queryFilters.find(f => f.filtro == 'fechaInicio')) {
      filtrosAplicados += ` -Rango De Fechas: ${moment(this.queryFilters.find(f => f.filtro == 'fechaInicio').parametro).format('DD-MM-YYYY')} al ${moment(this.queryFilters.find(f => f.filtro == 'fechaFin').parametro).format('DD-MM-YYYY')}`;
    }
    return filtrosAplicados;
  }

  cambiarFechaIngreso(registro: any) {
    if (!this.service.validarPermiso("Fecha De Ingreso")) {
      this.service.errorPermiso("Fecha De Ingreso");
      return;
    }
    this.sweetService.sweet_input_date(`Cambio De Fecha De Ingreso Para ${registro.nombrePiloto}`, "Ingrese la nueva Fecha De Ingreso para el registro", "warning", true).then(res => {
      if (res.value) {
        registro.ingreso = moment(res.value).format(this.service.getFormatoFechaHora());
        delete registro.estacion;
        delete registro.usuario;
        this.service.modificar(registro).subscribe(res => {
          this.sweetService.sweet_notificacion("Registro Actualizado", 5000, 'success');
          this.cargarPaginaFiltros();
        }, (error) => {
          console.log(error);
          this.sweetService.sweet_Error(error);
        });
      }
    });
  }

  cambiarFechaSalida(registro: any) {
    if (!this.service.validarPermiso("Fecha De Salida")) {
      this.service.errorPermiso("Fecha De Salida");
      return;
    }
    if (!registro.salida) {
      this.sweetService.sweet_alerta("Error", "El registro no posee una fecha de salida", "error");
      return;
    }
    this.sweetService.sweet_input_date(`Cambio De Fecha De Salida Para ${registro.nombrePiloto}`, "Ingreso la nueva Fecha De Salida para el registro", "warning", true).then(res => {
      if (res.value) {
        registro.salida = moment(res.value).format(this.service.getFormatoFechaHora());
        delete registro.estacion;
        delete registro.usuario;
        this.service.modificar(registro).subscribe(res => {
          this.sweetService.sweet_notificacion("Registro Actualizado", 5000, 'success');
          this.cargarPaginaFiltros();
        }, (error) => {
          console.log(error);
          this.sweetService.sweet_Error(error);
        });
      }
    });
  }

  getColumnas() {
    return this.service.getColumnas();
  }

  getPaginador() {
    return this.service.getPaginador();
  }

  getDatos() {
    return this.service.getDatos();
  }

  opcionDisponible(opcion: string): boolean {
    return this.service.validarPermiso(opcion);
  }

  validarPermiso() {
    if (this.service.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.service.errorPermiso("Consultar");
      this.service.paginaAnterior();
    }
  }

  get opcionesTabla() {
    return this.service.getMenuOpcionesTabla();
  }

  get configuracionComponent() {
    return this.service.getConfiguracionComponent();
  }
}
