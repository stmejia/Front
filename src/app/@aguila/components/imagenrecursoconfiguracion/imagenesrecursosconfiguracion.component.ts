import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ImagenRecursoConfiguracion } from "../../data/models/imagenrecursoconfiguracion";
import { ImagenrecursoconfiguracionService } from '../../data/services/imagenrecursoconfiguracion.service';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-imagenesrecursosconfiguracion',
  templateUrl: './imagenesrecursosconfiguracion.component.html',
  styleUrls: ['./imagenesrecursosconfiguracion.component.css']
})
export class ImagenesrecursosconfiguracionComponent extends BaseComponent implements OnInit {

  constructor(protected s: ImagenrecursoconfiguracionService, protected sw: SweetService, protected r: Router) {
    super("Imagenes Recurso Configuración", s, sw);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 2:
        this.s.navegar([this.rutaComponent, '']);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.s.navegar([this.rutaComponent, event.objeto.id]);
        break;
      case 2:
        this.s.navegar([this.rutaComponent, event.objeto.id]);
        break;
      case 3:
        this.eliminarItem(event.objeto);
        break;
    }
  }

  cargarComponent(): void {
    this.rutaComponent = this.r.url;
    this.header.opciones.push({
      icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
      idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
    });

    this.columnasTabla = [
      { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'left', visible: true },
      { titulo: 'Propiedad', target: ['propiedad'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Servidor', target: ['servidor'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Carpeta', target: ['carpeta'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Peso Máximo (Mb)', target: ['pesoMaxMb'], tipo: 'texto', aligment: 'right', visible: true },
      { titulo: '¿Multiples Imagenes?', target: ['multiplesImagenes'], tipo: 'boolean', aligment: 'center', visible: true },
      { titulo: 'No. Máximo De Imagenes', target: ['noMaxImagenes'], tipo: 'texto', aligment: 'right', visible: true },
      { titulo: 'Eliminación Fisica', target: ['eliminacionFisica'], tipo: 'boolean', aligment: 'center', visible: true },
      { titulo: 'Fecha de Creación', target: ['fchCreacion'], tipo: 'fecha', aligment: 'left', visible: true }
    ]

    this.menuDeOpcionesTabla = [
      { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
      { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
      { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 }
    ];

    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    this.filtros.push({
      nombre: "Propiedad",
      valores: [],
      filters: [{ filtro: "Propiedad", parametro: "" }],
      tipo: "input",
      activo: true,
      requerido: false
    });
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

  eliminarItem(item: ImagenRecursoConfiguracion) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el registro ${item.propiedad} }?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.s.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
            this.cargarPaginaFiltros();
          }, (error) => {
            console.log(error);
            this.sweetService.sweet_Error(error);
          });
        }
      });
  }
}
