import { TipoLista } from './../../data/models/tipoLista';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ListaService } from './../../data/services/lista.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { first, takeWhile } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { Lista } from '../../data/models/lista';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.css']
})
export class ListasComponent implements OnInit {
  cargandoDatos: boolean = true;
  noItems: number = 20;
  rutaComponent: string = "";
  tipoLista: TipoLista;
  private columnasDefault: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Valor', targetId: 'valor', tipo: 'texto', aligment: 'left' },
    { nombre: 'Descripcion', targetId: 'descripcion', tipo: 'texto', aligment: 'left' },
    { nombre: 'Fecha de Creacion', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];
  private subscriptions: Subscription = new Subscription();

  constructor(private serviceComponent: ListaService, private router: Router, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.validarPermiso();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  //Controla los eventos que emite el Header del Componente
  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      // El evento 1 del paginador es Cargar Datos
      case 1:
        this.cargarPagina(1);
        break;
      // El evento 2 del paginador es Registro Nuevo
      case 2:
        this.router.navigate([this.rutaComponent, '']);
        break;
    }
  }

  //Controla los eventos que emite las opciones que tenga la tabla
  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.router.navigate([this.rutaComponent, event.objeto.id]);
        break;
      case 2:
        this.router.navigate([this.rutaComponent, event.objeto.id]);
        break;
      case 3:
        this.eliminarItem(event.objeto);
        break;
    }
  }

  eventoBuscador(event: string) {
    this.cargarPagina(1, event)
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina, event.filtro);
  }

  eliminarItem(item: Lista) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el pais ${item.descripcion}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
        }
      })
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.subscriptions.add(this.router.events.subscribe(val => {
        if (val instanceof NavigationEnd) {
          this.cargandoDatos = true;
          this.cargarComponent();
        }
      }));
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso();
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    //Si la ruta es del componente cargamos las configuraciones por defecto 
    this.serviceComponent.setDatos([]);
    if (this.router.url.includes("listas")) {
      this.serviceComponent.getTipoLista(Number.parseInt(this.getIdTipoLista()))
        .pipe(first())
        .subscribe(res => {
          this.tipoLista = res;
          this.rutaComponent = this.router.url;
          this.serviceComponent.setConfiguracionComponent({
            header: {
              titulo: this.tipoLista.descripcion,
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
            { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 }
          ]);
          this.cargandoDatos = false;
        });
    }
  }

  getIdTipoLista(): string {
    return this.activatedRoute.snapshot.paramMap.get("idTipoLista");
  }

  cargarPagina(noPagina: number, filtroNombre: string = "") {
    this.cargandoDatos = true;
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.serviceComponent.cargarPagina(this.tipoLista.id, res.estacionTrabajo.sucursal.empresaId).pipe(first(value => value != null))
        .subscribe(res => {
          this.cargandoDatos = false;
        });
    })
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

  getDatos(idTipoLista: number) {
    return this.serviceComponent.getDatos(false, idTipoLista);
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
