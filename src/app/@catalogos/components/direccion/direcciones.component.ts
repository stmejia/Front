import { DireccionService } from './../../data/services/direccion.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Direccion } from '../../data/models/direccion';
import { first } from 'rxjs/operators';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { Columna } from 'src/app/@page/models/columna';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit {

  cargandoDatos: boolean = true;
  noItems: number = 20;
  rutaComponent: string = "";

  private columnasDefault: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'idMunicipio', target: ['idMunicipio'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'Colonia', target: ['colonia'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Zona', target: ['zona'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Cód. Postal', target: ['codigoPostal'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Dirección', target: ['direccion'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Fecha de Creación', target: ['fechaCreacion'], tipo: 'fecha', aligment: 'center', visible: true }
  ];

  constructor(private serviceComponent: DireccionService, private sweetService: SweetService,
    private router: Router) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.validarPermiso();
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

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    if (this.router.url.endsWith('direcciones')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Direcciones',
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
    }
    this.cargandoDatos = false;
  }

  cargarPagina(noPagina: number, filtroNombre: string = "") {
    this.serviceComponent.cargarPagina([])
  }

  eliminarItem(item: Direccion) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar la dirección ${item.direccion}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.serviceComponent.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
          });
        }
      })
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
