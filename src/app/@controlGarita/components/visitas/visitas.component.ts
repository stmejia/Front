import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first, retry } from 'rxjs/operators';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { SweetAlertOptions } from 'sweetalert2';
import { Visita } from '../../data/models/visita';
import { VisitasService } from '../../data/services/visitas.service';

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.component.html',
  styleUrls: ['./visitas.component.css']
})
export class VisitasComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];

  private columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'badge', target: ['dpi', 'imagenDefault', 'urlImagen'], tipo: 'imagen', aligment: 'center', visible: true },
    { titulo: "Nombre", target: ["nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Documento De Identificación", target: ["identificacion"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Motivo De La Visita", target: ["motivoVisita"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Empresa Que Visita", target: ["empresaVisita"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Area / Departamento", target: ["areaVisita"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Nombre A Quien Visita", target: ["nombreQuienVisita"], tipo: "texto", aligment: "center", visible: true },
    { titulo: "Vehículo", target: ["vehiculo"], tipo: "texto", aligment: "center", visible: true },
    { titulo: "Fecha Ingreso", target: ["ingreso"], tipo: "fecha", formatoFecha: "DD/MM/YYYY HH:mm:ss", aligment: "left", visible: true },
    { titulo: "Fecha Salida", target: ["salida"], tipo: "fecha", formatoFecha: "DD/MM/YYYY HH:mm:ss", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
  ];

  constructor(private service: VisitasService, private sweetService: SweetService, private router: Router,
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
      case 2:
        this.marcarSalida(null);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.marcarSalida(event.objeto);
        break;
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
        titulo: 'Control De Ingresos Y Egresos De Visitantes',
        opciones: [
          {
            icono: 'logout', nombre: 'Registrar Salida', disponible: this.opcionDisponible('Salida'),
            idEvento: 2, toolTip: 'Registrar Salida De Visita', color: 'primary'
          },
          {
            icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Ingreso'),
            idEvento: 1, toolTip: 'Agregar registro nuevo', color: 'primary'
          },
        ]
      },
      isModal: false,
    });

    this.service.setMenuOpcionesTabla([
      { icono: 'logout', nombre: "Registrar Salida", disponible: this.opcionDisponible("Salida"), idEvento: 1 },
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
        filters: [{ filtro: "nombre", parametro: "" }],
        tipo: "input",
        tipoInput: "string",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Motivo De La Visita",
        valores: [],
        filters: [{ filtro: "motivoVisita", parametro: "" }],
        tipo: "input",
        tipoInput: "string",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Area / Departamento",
        valores: [],
        filters: [{ filtro: "areaVisita", parametro: "" }],
        tipo: "input",
        tipoInput: "string",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Nombre A Quien Visita",
        valores: [],
        filters: [{ filtro: "nombreQuienVisita", parametro: "" }],
        tipo: "input",
        tipoInput: "string",
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
        nombre: "En Predio",
        valores: [{ nombre: "Si", valor: true }, { nombre: "No", valor: false }],
        filters: [{ filtro: "enPredio", parametro: "" }],
        tipo: "lista",
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
        text: this.service.getEmpresa().nombre,
        bold: true,
        size: 18
      },
      subTitulos: [
        { text: "FOR-TT-SF-02", bold: true, size: 10 },
        { text: "CONTROL DE INGRESO Y EGRESO DE VISITANTES", bold: true, size: 16 }
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
        size: 16
      },
      subTitulos: [
        { text: "FOR-TT-SF-02", bold: true, size: 10 },
        { text: "CONTROL DE INGRESO Y EGRESO DE VISITANTES", bold: true, size: 16 }
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
          case "nombre":
            filtrosAplicados += ` -Nombre: ${f.parametro}`;
            break;
          case "motivoVisita":
            filtrosAplicados += ` -Motivo De La Visita: ${f.parametro}`;
            break;
          case "areaVisita":
            filtrosAplicados += ` -Area / Departamento: ${f.parametro}`;
            break;
          case "nombreQuienVisita":
            filtrosAplicados += ` -Nombre A Quien Visita: ${f.parametro}`;
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

  marcarSalida(visita: Visita) {
    if (!visita) {
      this.sweetService.sweet_input("Egreso De Visita",
        "Ingrese el Documento De Identificación de la visita para marcar la salida",
        "text", "Ingrese el Documento De Identificación", true, 'info')
        .then((identificacion: any) => {
          if (identificacion) {
            this.service.buscarVisitaIdentificacion(identificacion).subscribe(visita => {
              let opt: SweetAlertOptions = {
                title: "Egreso De Visita",
                imageUrl: visita.dpi ? visita.dpi.imagenDefault.urlImagen : "./assets/img/LogoApp.png",
                text: `¿Desea dar salida a ${visita.nombre}?`,
                showConfirmButton: true,
                showCancelButton: true,
                cancelButtonText: "Cancelar",
                confirmButtonText: "Si"
              }
              this.sweetService.sweet_custom(opt).then(res => {
                if (res.isConfirmed) {
                  this.service.marcarSalida(visita.identificacion).subscribe(res => {
                    this.sweetService.sweet_alerta("Salida Marcada", "Salida registrada", 'success');
                    this.cargarPaginaFiltros();
                  }, (error) => {
                    this.sweetService.sweet_Error(error)
                  });;
                }
              });
            }, (error) => this.sweetService.sweet_Error(error));
          }
        });
    } else {
      let opt: SweetAlertOptions = {
        title: "Egreso De Visita",
        imageUrl: visita.dpi ? visita.dpi.imagenDefault.urlImagen : "./assets/img/LogoApp.png",
        text: `¿Desea dar salida a ${visita.nombre}?`,
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Si"
      }
      this.sweetService.sweet_custom(opt).then(res => {
        if (res.isConfirmed) {
          this.service.marcarSalida(visita.identificacion).subscribe(res => {
            this.sweetService.sweet_alerta("Salida Marcada", "Salida registrada", 'success');
            this.cargarPaginaFiltros();
          }, (error) => {
            this.sweetService.sweet_Error(error)
          });;
        }
      });
    }
  }

  cambiarFechaIngreso(visita: Visita) {
    if (!this.service.validarPermiso("Fecha De Ingreso")) {
      this.service.errorPermiso("Fecha De Ingreso");
      return;
    }
    this.sweetService.sweet_input_date(`Cambio De Fecha De Ingreso Para ${visita.nombre}`, "Ingrese la nueva Fecha De Ingreso para el registro", "warning", true).then(res => {
      if (res.value) {
        visita.ingreso = moment(res.value).format(this.service.getFormatoFechaHora());
        delete visita.estacion;
        delete visita.usuario;
        this.service.modificar(visita).subscribe(res => {
          this.sweetService.sweet_notificacion("Registro Actualizado", 5000, 'success');
          this.cargarPaginaFiltros();
        }, (error) => {
          console.log(error);
          this.sweetService.sweet_Error(error);
        });
      }
    });
  }

  cambiarFechaSalida(visita: Visita) {
    if (!this.service.validarPermiso("Fecha De Salida")) {
      this.service.errorPermiso("Fecha De Salida");
      return;
    }
    if (!visita.salida) {
      this.sweetService.sweet_alerta("Error", "La visita no posee una fecha de salida", "error");
      return;
    }
    this.sweetService.sweet_input_date(`Cambio De Fecha De Salida Para ${visita.nombre}`, "Ingrese la nueva Fecha De Salida para el registro", "warning", true).then(res => {
      if (res.value) {
        visita.salida = moment(res.value).format(this.service.getFormatoFechaHora());
        delete visita.estacion;
        delete visita.usuario;
        this.service.modificar(visita).subscribe(res => {
          this.sweetService.sweet_notificacion("Registro Actualizado", 5000, 'success');
          this.cargarPaginaFiltros();
        }, (error) => {
          console.log(error);
          this.sweetService.sweet_Error(error);
        });
      }
    });
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
