import { Component, OnInit } from '@angular/core';
import { EstaciontrabajoService } from '../../data/services/estaciontrabajo.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { Estaciontrabajo } from '../../data/models/estaciontrabajo';
@Component({
  selector: 'app-estacionestrabajo',
  templateUrl: './estacionestrabajo.component.html',
  styleUrls: ['./estacionestrabajo.component.css']
})
export class EstacionestrabajoComponent extends BaseComponent implements OnInit {

  constructor(protected sw: SweetService, protected s: EstaciontrabajoService, protected r: Router) {
    super("Estaciones De Trabajo", s, sw);
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
    this.headerComponent.opciones.push({
      icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
      idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
    });

    this.columnasTabla = [
      { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'left', visible: true },
      { titulo: 'Código', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Nombre', target: ['nombre'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Tipo', target: ['tipo'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: '¿Activo?', target: ['activa'], tipo: 'boolean', aligment: 'left', visible: true },
      { titulo: 'Fecha de Creación', target: ['fchCreacion'], tipo: 'fecha', aligment: 'left', visible: true }
    ];

    this.menuDeOpcionesTabla = [
      { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
      { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
      { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 }
    ];

    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    this.filtros.push({
      nombre: "Nombre Sucursal",
      valores: [],
      filters: [{ filtro: "nombre", parametro: "" }],
      tipo: "input",
      activo: true,
      requerido: false
    });
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

  eliminarItem(item: Estaciontrabajo) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el registro ${item.codigo} - ${item.nombre}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.s.eliminar(item.id).subscribe(res => {
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