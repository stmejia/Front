import { PilotoTipo } from './../../data/models/pilotoTipo';
import { PilotoTipoService } from './../../data/services/piloto-tipo.service';
import { Component, OnInit } from '@angular/core';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { Columna } from 'src/app/@page/models/columna';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';

@Component({
  selector: 'app-pilotos-tipos',
  templateUrl: './pilotos-tipos.component.html',
  styleUrls: ['./pilotos-tipos.component.css']
})
export class PilotosTiposComponent implements OnInit {

  cargandoDatos: boolean = true;
  noItems: number = 20;
  rutaComponent: string = "";

  private columnasDefault: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código:', targetId: 'codigo', tipo: 'texto', aligment: 'left' },
    { nombre: 'Descripción', targetId: 'descripcion', tipo: 'texto', aligment: 'left' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  constructor(private serviceComponent: PilotoTipoService, private sweetService: SweetService,
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
      this.serviceComponent.errorPermiso();
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    if (this.router.url.endsWith('pilotosTipos')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Tipos de Pilotos',
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
    this.cargandoDatos = true;
    this.serviceComponent.cargarPagina(noPagina).pipe(
      first(value => value != null)
    ).subscribe(res => {
      this.cargandoDatos = false;
    });
  }

  eliminarItem(item: PilotoTipo) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el Tipo de Piloto ${item.descripcion}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.serviceComponent.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
          });
        }
      })
  }

  //Devuelve las columnas a mostrar
  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  //Devuelve los datos a mostrar en la lista
  getDatos() {
    return this.serviceComponent.getDatos();
  }

  //Carga el paginador 
  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

  //Metodo para validar permisos
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
