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
import { EmpleadosIngresosService } from '../../data/services/empleados-ingresos.service';

@Component({
  selector: 'app-colaboradores',
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];

  private columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: "Nombre", target: [], targetConcatenar: [['empleado', 'nombres'], ['empleado', 'apellidos']], caracterConcatenar: " ", tipo: "concatenar", aligment: "left", visible: true },
    { titulo: "CUI", target: ["cui"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Movimiento", target: ["evento"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Vehículo", target: ["vehiculo"], tipo: "texto", aligment: "center", visible: true },
    { titulo: "Fecha", target: ["fechaEvento"], formatoFecha: "DD/MM/YYYY HH:mm:ss", tipo: "fecha", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
  ];

  constructor(private service: EmpleadosIngresosService, private sweetService: SweetService, private router: Router,
    private reporteService: ReportesService) { }

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
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.cambiarFechaRegistro(event.objeto);
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
        titulo: 'Control De Ingresos Y Salidas De Colaboradores',
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
      { icono: 'edit_calendar', nombre: "Cambiar Fecha De Registro", disponible: this.opcionDisponible("Cambio De Fecha"), idEvento: 1 }
    ]);
    this.service.setColumnas(this.columnas);

    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    let filtros: FiltrosC[] = [
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

  cambiarFechaRegistro(registro: any) {
    if (!this.service.validarPermiso("Cambio De Fecha")) {
      this.service.errorPermiso("Cambio De Fecha");
      return;
    }
    this.sweetService.sweet_input_date(`Cambio De Fecha De Registro Para ${registro.empleado.nombres}`, "Ingrese la nueva Fecha para el registro", "warning", true).then(res => {
      if (res.value) {
        registro.fechaEvento = moment(res.value).format(this.service.getFormatoFechaHora());
        delete registro.estacion;
        delete registro.usuario;
        delete registro.empleado;
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

  generarPdf(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.service.getEmpresa().nombre,
        bold: true,
        size: 18
      },
      subTitulos: [
        { text: "FOR-TT-RH-02", bold: true, size: 10 },
        { text: "CONTROL DE INGRESO Y SALIDA DEL PERSONAL", bold: true, size: 16 }
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
        text: this.service.getEmpresa().nombre,
        bold: true,
        size: 18
      },
      subTitulos: [
        { text: "FOR-TT-RH-02", bold: true, size: 10 },
        { text: "CONTROL DE INGRESO Y SALIDA DEL PERSONAL", bold: true, size: 16 }
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
          case "evento":
            filtrosAplicados += ` -Movimiento: ${f.parametro}`;
            break;
        }
      }
    });
    if (this.queryFilters.find(f => f.filtro == 'fechaInicio')) {
      filtrosAplicados += ` -Rango De Fechas: ${moment(this.queryFilters.find(f => f.filtro == 'fechaInicio').parametro).format('DD-MM-YYYY')} al ${moment(this.queryFilters.find(f => f.filtro == 'fechaFin').parametro).format('DD-MM-YYYY')}`;
    }
    return filtrosAplicados;
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
