import { SweetService } from 'src/app/@page/services/sweet.service';
import { TipoLista } from './../../data/models/tipoLista';
import { Router } from '@angular/router';
import { TipoListaService } from './../../data/services/tipo-lista.service';
import { Component, OnInit } from '@angular/core';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';

@Component({
  selector: 'app-tipos-listas',
  templateUrl: './tipos-listas.component.html',
  styleUrls: ['./tipos-listas.component.css']
})
export class TiposListasComponent implements OnInit {

  cargandoDatos: boolean = true;
  noItems: number = 20;
  rutaComponent: string = "";
  private columnasDefault: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Descripción', targetId: 'descripcion', tipo: 'texto', aligment: 'left' },
    { nombre: 'idRecurso', targetId: 'idRecurso', tipo: 'texto', aligment: 'center' },
    { nombre: 'Tipo de Dato', targetId: 'tipoDato', tipo: 'texto', aligment: 'center' },
    { nombre: 'Campo', targetId: 'campo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
    //{ nombre: '', targetId: '', texto: true, aligment:'center'},
  ];

  constructor(private tipoListaService: TipoListaService, private router: Router, private sweetService: SweetService) { }

  ngOnInit(): void {
    this.tipoListaService.getCargando().pipe(
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

  eventoBuscador(event: string) {
    //this.cargarPagina(1, event)
  }

  //Controla los eventos que emite el Paginador
  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
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

  validarPermiso() {
    if (this.tipoListaService.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.tipoListaService.errorPermiso();
      this.tipoListaService.paginaAnterior();
    }
  }

  cargarComponent() {
    //Si la ruta es del componente cargamos las configuraciones por defecto 
    if (this.router.url.endsWith('tiposListas')) {
      //Guardamos la ruta donde se esta iniciando el componente
      //Esto servira para poder navegar a otras pantallas
      this.rutaComponent = this.router.url;
      //Seteamos la configuracion para el componente
      this.tipoListaService.setConfiguracionComponent({
        header: {
          titulo: 'Tipos De Listas',
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
      this.tipoListaService.setColumnas(this.columnasDefault);
      //Seteamos las opciones que tendra cada Item de la tabla
      /* Los IDs de eventos sirven para idenficar las opciones en el menu 
        de esa forma podremos ejecutar diferentes funciones en base al menu
      */
      this.tipoListaService.setMenuOpcionesTabla([
        { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
        { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
        { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 }
      ]);
    }
    this.cargandoDatos = false;
  }

  cargarPagina(noPagina: number, filtroNombre: string = "") {
    this.cargandoDatos = true;
    this.tipoListaService.cargarPagina(this.noItems, noPagina, filtroNombre).pipe(
      first(value => value != null)
    )
      .subscribe(res => {
        this.cargandoDatos = false;
      });
  }

  //Devuelve las columnas a mostrar
  getColumnas() {
    return this.tipoListaService.getColumnas();
  }

  getDatos() {
    return this.tipoListaService.getTiposListas();
  }

  getPaginador() {
    return this.tipoListaService.getPaginador();
  }

  eliminarItem(item: TipoLista) {
    this.sweetService
      .sweet_confirmacion(
        "¡Advertencia!",
        `¿Desea eliminar el tipo de lista ${item.descripcion}?`,
        "warning"
      )
      .then((res) => {
        if (res.isConfirmed) {
          this.tipoListaService.eliminar(item.id).pipe(
            first()
          ).subscribe(res => {
            this.sweetService.sweet_notificacion(
              "Registro Eliminado",
              5000,
              "success"
            );
          });
        }
      });
  }

  opcionDisponible(opcion: string): boolean {
    return this.tipoListaService.validarPermiso(opcion);
  }

  getMenuOpcionesTabla() {
    return this.tipoListaService.getMenuOpcionesTabla();
  }

  get configuracionComponent() {
    return this.tipoListaService.getConfiguracionComponent();
  }

}
