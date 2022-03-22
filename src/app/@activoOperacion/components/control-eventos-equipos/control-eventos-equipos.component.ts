import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { SweetAlertOptions } from 'sweetalert2';
import { EventosControlEquipo } from '../../data/models/eventosControlEquipo';
import { ControlEventosEquiposService } from '../../data/services/control-eventos-equipos.service';

@Component({
  selector: 'app-control-eventos-equipos',
  templateUrl: './control-eventos-equipos.component.html',
  styleUrls: ['./control-eventos-equipos.component.css']
})
export class ControlEventosEquiposComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  private queryFilters: QueryFilter[] = [];

  private columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: "No.", target: ["id"], tipo: "texto", aligment: "right", visible: true },
    { titulo: "Fecha", target: ["fechaCreacion"], tipo: "fecha", aligment: "left", visible: true },
    { titulo: "Estado", target: ["estado"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Evento", target: ["descripcionEvento"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Descripción", target: ["bitacoraObservaciones"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "CUI", target: ["activoOperacion", "codigo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Predio", target: ["estacionTrabajo", "codigo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Fecha Revisado", target: ["fechaRevisado"], tipo: "fecha", aligment: "left", visible: true },
    { titulo: "Fecha Resuelto", target: ["fechaResuelto"], tipo: "fecha", aligment: "left", visible: true },
    { titulo: "Fecha Anulado", target: ["fechaAnulado"], tipo: "fecha", aligment: "left", visible: true }
  ];

  constructor(private serviceComponent: ControlEventosEquiposService, private sweetService: SweetService,
    private router: Router, private reporteService: ReportesService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(val => val === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {

  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.mostrarEvento(event.objeto);
        break;
      case 2:
        this.revisarEvento(event.objeto);
        break;
      case 3:
        this.resolverEvento(event.objeto);
        break;
      case 4:
        this.anularEvento(event.objeto);
        break;
    }
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
        titulo: 'Control De Eventos',
        opciones: [
        ]
      },
      isModal: false,
    });

    this.serviceComponent.setColumnas(this.columnas);
    this.serviceComponent.setMenuOpcionesTabla([
      { icono: 'search', nombre: 'Consultar', disponible: this.opcionDisponible('Revisar'), idEvento: 1 },
      { icono: 'check', nombre: 'Revisar', disponible: this.opcionDisponible('Revisar'), idEvento: 2 },
      { icono: 'task_alt', nombre: 'Resolver', disponible: this.opcionDisponible('Revisar'), idEvento: 3 },
      { icono: 'highlight_off', nombre: 'Anular', disponible: this.opcionDisponible('Revisar'), idEvento: 4 },
    ]);
    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    let filtros: FiltrosC[] = [
      {
        nombre: "Código De Equipo: ",
        valores: [],
        filters: [{ filtro: "tipoActivo", parametro: "" }],
        tipo: "input",
        tipoInput: "string",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Tipo De Equipos: ",
        valores: [
          { nombre: "Todos", valor: "" },
          { nombre: "Vehículos", valor: "V" },
          { nombre: "Equipos De Remolque", valor: "E" },
          { nombre: "Generadores", valor: "G" },
        ],
        filters: [{ filtro: "categoria", parametro: "" }],
        tipo: "lista",
        activo: true,
        requerido: false,
      },
      {
        nombre: "Estados: ",
        valores: [
          { nombre: "Creado", valor: "CREADO" },
          { nombre: "Revisado", valor: "REVISADO" },
          { nombre: "Resuelto", valor: "Resuelto" },
          { nombre: "Anulado", valor: "ANULADO" }],
        filters: [{ filtro: "estado", parametro: "" }],
        tipo: "lista",
        activo: true,
        requerido: false,
      },
    ]

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

  mostrarEvento(evento: EventosControlEquipo) {
    let anotaciones = evento.bitacoraObservaciones.split('|');
    let opt: SweetAlertOptions = {
      title: evento.descripcionEvento,
      heightAuto: false,
      showCancelButton: true,
      showConfirmButton: false,
      html: `
      <p class="text-left p-0 m-0"><b>Estado: </b>${evento.estado}</p>
      <p class="text-left p-0 m-0"><b>CUI: </b>${evento.activoOperacion.codigo}</p>
      <p class="text-left p-0 m-0"><b>Fecha Creación: </b>${moment(evento.fechaCreacion).format('DD-MM-YYYY hh:mm')}</p>
      <p class="text-left p-0 m-0"><b>Usuario Creación: </b>${evento.usuarioCreacion.nombre}</p>
      <p class="text-left p-0 m-0"><b>Anotaciones: </b></p>
      `
    }
    anotaciones.forEach((s, i) => {
      opt.html += `<p class="text-left p-0 m-0">${s}</p>`;
    });
    opt.html += `
    <p class="text-left p-0 m-0"><b>Fecha Revisión: </b>${evento.fechaRevisado ? moment(evento.fechaRevisado).format('DD-MM-YYYY hh:mm') : ''}</p>
      <p class="text-left p-0 m-0"><b>Usuario Revisa: </b>${evento.usuarioRevisa ? evento.usuarioRevisa.nombre : ''}</p>
      <p class="text-left p-0 m-0"><b>Fecha Resuelto: </b>${evento.fechaResuelto ? moment(evento.fechaResuelto).format('DD-MM-YYYY hh:mm') : ''}</p>
      <p class="text-left p-0 m-0"><b>Usuario Resuelve: </b>${evento.usuarioResuelve ? evento.usuarioResuelve.nombre : ''}</p>
      <p class="text-left p-0 m-0"><b>Fecha Anulado: </b>${evento.fechaAnulado ? moment(evento.fechaAnulado).format('DD-MM-YYYY hh:mm') : ''}</p>
      <p class="text-left p-0 m-0"><b>Usuario Anula: </b>${evento.usuarioAnula ? evento.usuarioAnula.nombre : ''}</p>
    `;

    this.sweetService.sweet_custom(opt);
  }

  revisarEvento(evento: EventosControlEquipo) {
    let opt: SweetAlertOptions = {
      title: evento.descripcionEvento,
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Aplicar Revisión",
      html: `
      <p class="text-left p-0 m-0"><b>Estado: </b>${evento.estado}</p>
      <p class="text-left p-0 m-0"><b>CUI: </b>${evento.activoOperacion.codigo}</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let eventoRevisa: EventosControlEquipo = {
          id: evento.id,
          bitacoraObservaciones: r.value ? r.value : '',
          idUsuarioRevisa: this.serviceComponent.getUsuario().id,
        }
        this.serviceComponent.setRevision(eventoRevisa).subscribe(res => {
          this.sweetService.sweet_notificacion('Registro Guardado', 5000, 'info');
          this.cargarPaginaFiltros();
        });
      }
    })
  }

  resolverEvento(evento: EventosControlEquipo) {
    let opt: SweetAlertOptions = {
      title: evento.descripcionEvento,
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Resolver",
      html: `
      <p class="text-left p-0 m-0"><b>Estado: </b>${evento.estado}</p>
      <p class="text-left p-0 m-0"><b>CUI: </b>${evento.activoOperacion.codigo}</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let eventoRevisa: EventosControlEquipo = {
          id: evento.id,
          bitacoraObservaciones: r.value ? r.value : '',
          idUsuarioRevisa: this.serviceComponent.getUsuario().id,
        }
        this.serviceComponent.setSolucion(eventoRevisa).subscribe(res => {
          this.sweetService.sweet_notificacion('Registro Guardado', 5000, 'info');
          this.cargarPaginaFiltros();
        });
      }
    })
  }

  anularEvento(evento: EventosControlEquipo) {
    let opt: SweetAlertOptions = {
      title: evento.descripcionEvento,
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Anular",
      html: `
      <p class="text-left p-0 m-0"><b>Estado: </b>${evento.estado}</p>
      <p class="text-left p-0 m-0"><b>CUI: </b>${evento.activoOperacion.codigo}</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let eventoRevisa: EventosControlEquipo = {
          id: evento.id,
          bitacoraObservaciones: r.value ? r.value : '',
          idUsuarioRevisa: this.serviceComponent.getUsuario().id,
        }
        this.serviceComponent.anular(eventoRevisa).subscribe(res => {
          this.sweetService.sweet_notificacion('Registro Guardado', 5000, 'info');
          this.cargarPaginaFiltros();
        });
      }
    })
  }

  generarPdf(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Eventos De Equipos", bold: true, size: 18 }
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
        { text: "Eventos De Equipos", bold: true, size: 14 },
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

  getFiltrosComponent() {
    return this.serviceComponent.getFiltrosComponent();
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    this.queryFilters.push({ filtro: "idEstacionTrabajo", parametro: this.serviceComponent.getEstacionTrabajo().id });
    this.serviceComponent.setDatos([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
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
