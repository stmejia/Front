import { OpcionesHeaderComponent } from './../../../@page/models/headers';
import { EventoMenuOpciones } from './../../../@page/models/menu';
import { PaisService } from './../../data/services/pais.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { Columna } from 'src/app/@page/models/columna';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Pais } from '../../data/models/pais';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css']
})

export class PaisesComponent implements OnInit {

  private subscriptions: Subscription = new Subscription();
  cargandoDatos: boolean = true;
  noItems: number = 20;
  rutaComponent: string = "";

  private columnasDefault: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Nombre', targetId: 'nombre', tipo: 'texto', aligment: 'left' },
    { nombre: 'Cód de Moneda', targetId: 'codMoneda', tipo: 'texto', aligment: 'center' },
    { nombre: 'Alfa 2', targetId: 'codAlfa2', tipo: 'texto', aligment: 'center' },
    { nombre: 'Alfa 3', targetId: 'codAlfa3', tipo: 'texto', aligment: 'center' },
    { nombre: 'Cód Numerico', targetId: 'codNumerico', tipo: 'texto', aligment: 'center' },
    { nombre: 'Idioma', targetId: 'idioma', tipo: 'texto', aligment: 'center' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' },
    //{ nombre: '', targetId: '', texto: true, aligment:'center'},
  ];

  constructor(private sweetService: SweetService,
    public paisService: PaisService, private router: Router) { }

  ngOnInit(): void {
    //Esperamos a que el Service se inicialice
    this.paisService.getCargando().pipe(
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

  //Controla los eventos que emite el buscador
  eventoBuscador(event: string) {
    this.cargarPagina(1, event)
  }

  //Controla los eventos que emite el Paginador
  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina, event.filtro);
  }

  //Validamos el permiso inicial para mostrar el componente
  validarPermiso() {
    if (this.paisService.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.paisService.errorPermiso();
      this.paisService.paginaAnterior();
    }
  }

  //Cargamos las configuraciones iniciales del componente
  cargarComponent() {
    //Si la ruta es del componente cargamos las configuraciones por defecto 
    if (this.router.url.endsWith('paises')) {
      //Guardamos la ruta donde se esta iniciando el componente
      //Esto servira para poder navegar a otras pantallas
      this.rutaComponent = this.router.url;
      //Seteamos la configuracion para el componente
      this.paisService.setConfiguracionComponent({
        header: {
          titulo: 'Paises',
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
      this.paisService.setColumnas(this.columnasDefault);
      //Seteamos las opciones que tendra cada Item de la tabla
      /* Los IDs de eventos sirven para idenficar las opciones en el menu 
        de esa forma podremos ejecutar diferentes funciones en base al menu
      */
      this.paisService.setMenuOpcionesTabla([
        { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
        { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
        { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 }
      ]);
    }
    this.cargandoDatos = false;
  }

  cargarPagina(noPagina: number, filtroNombre: string = "") {
    this.cargandoDatos = true;
    this.paisService.cargarPagina(filtroNombre).pipe(
      first(value => value != null)
    )
      .subscribe(res => {
        this.cargandoDatos = false;
      });
  }

  eliminarItem(pais: Pais) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el pais ${pais.nombre}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.paisService.eliminar(pais.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
          });
        }
      })
  }

  //Devuelve las columnas a mostrar
  getColumnas() {
    return this.paisService.getColumnas();
  }

  //Devuelve los datos a mostrar en la lista
  getDatos() {
    return this.paisService.getPaises();
  }

  //Carga el paginador 
  getPaginador() {
    return this.paisService.getPaginador();
  }

  //Metodo para validar permisos
  opcionDisponible(opcion: string): boolean {
    return this.paisService.validarPermiso(opcion);
  }

  getMenuOpcionesTabla() {
    return this.paisService.getMenuOpcionesTabla();
  }

  get configuracionComponent() {
    return this.paisService.getConfiguracionComponent();
  }
}
