import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador, Paginador } from 'src/app/@page/models/paginador';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { EquipoRemolqueService } from '../../data/services/equipo-remolque.service';
import { TipoEquipoRemolqueService } from '../../data/services/tipo-equipo-remolque.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';

@Component({
  selector: 'app-equipos-remolque',
  templateUrl: './equipos-remolque.component.html',
  styleUrls: ['./equipos-remolque.component.css']
})
export class EquiposRemolqueComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  esModal: boolean = false;

  private columnasDefault: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'CUI', target: ['activoOperacion', 'codigo'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'COC', target: ['activoOperacion', 'coc'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'Observaciones', target: ['activoOperacion', 'descripcion'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Marca', target: ['activoOperacion', 'marca'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Serie', target: ['activoOperacion', 'serie'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Modelo (Año)', target: ['activoOperacion', 'modeloAnio'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'Transporte', target: ['activoOperacion', "transporte", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: 'Fecha de Creación', target: ['activoOperacion', 'fechaCreacion'], tipo: 'fecha', aligment: 'center', visible: true }
  ];

  private queryFilters: QueryFilter[] = [];

  constructor(private serviceComponent: EquipoRemolqueService, private sweetService: SweetService, private router: Router,
    private tipoEquipoRemolqueService: TipoEquipoRemolqueService) { }

  ngOnInit(): void {
    forkJoin([
      this.tipoEquipoRemolqueService.getCargando().pipe(first(value => value === false)),
      this.serviceComponent.getCargando().pipe(first(value => value === false))
    ]).subscribe(res => {
      this.validarPermiso()
    });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.cargarPagina(1);
        break;
      case 2:
        this.router.navigate([this.rutaComponent, '']);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.router.navigate([this.rutaComponent, event.objeto.idActivo]);
        break;
      case 2:
        this.router.navigate([this.rutaComponent, event.objeto.idActivo]);
        break;
      case 3:
        this.descargarDocumentos(event.objeto.idActivo);
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
      this.serviceComponent.errorPermiso();
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    if (this.router.url.endsWith('equiposRemolque')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Equipos de Remolque',
          opciones: [
            {
              icono: 'refresh', nombre: 'Mostrar Datos', disponible: this.opcionDisponible('Consultar'),
              idEvento: 1, toolTip: 'Mostrar lista de datos', color: 'primary'
            },
            {
              icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
              idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
            }
          ]
        },
        isModal: false,
      });
      this.serviceComponent.setColumnas(this.columnasDefault);
      this.serviceComponent.setMenuOpcionesTabla([
        { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
        { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
        { icono: 'downloading', nombre: 'Descargar Documentos', disponible: this.opcionDisponible('Consultar'), idEvento: 3 },
      ]);
      this.setFiltrosComponent();
    } else {
      this.cargandoDatos = false;
    }
  }

  descargarDocumentos(id) {
    this.serviceComponent.getId(id).subscribe(res => {
      if (res.imagenTarjetaCirculacion) {
        if (res.imagenTarjetaCirculacion.imagenes) {
          if (res.imagenTarjetaCirculacion.imagenes.length <= 0) {
            this.sweetService.sweet_alerta("Error", "El equipo no cuenta con documentos", "error");
            return;
          }
          res.imagenTarjetaCirculacion.imagenes.forEach(img => {
            this.serviceComponent.descargarImagen(img);
          });
        } else {
          this.sweetService.sweet_alerta("Error", "El equipo no cuenta con documentos", "error");
        }
      } else {
        this.sweetService.sweet_alerta("Error", "El equipo no cuenta con documentos", "error");
      }
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_Error(error);
    })
  }

  cargarPagina(noPagina: number) {
    this.queryFilters.forEach((f, i) => {
      if (f.filtro == "PageNumber") {
        this.queryFilters[i].parametro = noPagina;
      }
    });
    this.serviceComponent.cargarPagina(this.queryFilters);
  }

  cargarPaginaFiltros() {
    if (this.queryFilters.length > 0) {
      this.serviceComponent.cargarPagina(this.queryFilters);
    }
  }

  setFiltrosComponent() {
    let tipoVehiculos = this.serviceComponent.getTiposEquiposRemolqueValue();
    let filtros: FiltrosC[] = [];
    let f: FiltrosC = {
      activo: true,
      nombre: "Tipo De Equipo Remolque",
      filters: [{ filtro: "idTipoEquipoRemolque", parametro: "" }],
      tipo: "lista",
      requerido: false,
      valores: [{ nombre: "Todos", valor: "" }]
    }
    tipoVehiculos.forEach((t => {
      f.valores.push({ nombre: t.prefijo + "-" + t.descripcion, valor: t.id })
    }));
    filtros.push(f);
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
      nombre: "Equipo Prpio",
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

    this.serviceComponent.setFiltrosComponent(filtros);
    this.cargandoDatos = false;
  }

  getFiltros(filtros) {
    this.queryFilters = filtros;
    this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
    this.serviceComponent.setDatos([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.");
  }

  getFiltrosComponent() {
    return this.serviceComponent.getFiltrosComponent();
  }

  getTipoEquipoRemolque() {
    return this.tipoEquipoRemolqueService.getDatos();
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  getDatos() {
    return this.serviceComponent.getDatos();
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
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

}
