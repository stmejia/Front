import { TipoReparacion } from './../../data/models/tipoReparaciones';
import { TipoReparacionesService } from './../../data/services/tipo-reparaciones.service';
import { Component, OnInit } from '@angular/core';
import { Columna } from 'src/app/@page/models/columna';
import { Router } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-tipos-reparaciones',
  templateUrl: './tipos-reparaciones.component.html',
  styleUrls: ['./tipos-reparaciones.component.css']
})

export class TiposReparacionesComponent implements OnInit {

  cargandoDatos: boolean = true;
  noItems: number = 20;
  rutaComponent: string = "";

  private columnasDefault: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'left' },
    { nombre: 'Nombre', targetId: 'nombre', tipo: 'texto', aligment: 'left' },
    { nombre: 'Descripción', targetId: 'descripcion', tipo: 'texto', aligment: 'left' },
    //{ nombre: 'Id Empresa', targetId: 'idEmpresa', tipo: 'texto', aligment: 'center' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'right' },
  ];

  constructor(private serviceComponent: TipoReparacionesService, private sweetService: SweetService,
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

  //Controla los eventos que emite el buscador
  eventoBuscador(event: string) {
    this.cargarPagina(1, event)
  }

  //Controla los eventos que emite el Paginador
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

  //Cargamos las configuraciones iniciales del componente
  cargarComponent() {
    //Si la ruta es del componente cargamos las configuraciones por defecto 
    if (this.router.url.endsWith('tipoReparaciones')) {
      //Guardamos la ruta donde se esta iniciando el componente
      //Esto servira para poder navegar a otras pantallas
      this.rutaComponent = this.router.url;
      //Seteamos la configuracion para el componente
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Tipos de Reparaciones',
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
      //Seteamos las columnas que mostrara la tabla de datos
      this.serviceComponent.setColumnas(this.columnasDefault);
      //Seteamos las opciones que tendra cada Item de la tabla
      /* Los IDs de eventos sirven para idenficar las opciones en el menu 
        de esa forma podremos ejecutar diferentes funciones en base al menu
      */
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

  eliminarItem(item: TipoReparacion) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el pais ${item.nombre}?`,
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
