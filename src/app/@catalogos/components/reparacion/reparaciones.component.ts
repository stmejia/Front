import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Reparacion } from '../../data/models/reparacion';
import { ReparacionService } from '../../data/services/reparacion.service';

@Component({
  selector: 'app-reparaciones',
  templateUrl: './reparaciones.component.html',
  styleUrls: ['./reparaciones.component.css']
})

export class ReparacionesComponent extends BaseComponent implements OnInit {

  constructor(protected sw: SweetService, protected s: ReparacionService, protected r: Router) {
    super("Reparaciones", s, sw);
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

  cargarComponent() {
    this.rutaComponent = this.r.url;
    this.header.opciones.push({
      icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
      idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
    });

    this.columnasTabla = [
      { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'left', visible: true },
      { titulo: 'Código', target: ['codigo'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Nombre', target: ['nombre'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Descripción', target: ['descripcion'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Horas Hombre', target: ['horasHombre'], tipo: 'texto', aligment: 'right', visible: true },
      { titulo: 'Fecha de Creación', target: ['fechaCreacion'], tipo: 'fecha', aligment: 'right', visible: true }
    ];

    this.menuDeOpcionesTabla = [
      { icono: 'find_in_page', nombre: 'Consultar', disponible: this.opcionDisponible('Consultar'), idEvento: 1 },
      { icono: 'create', nombre: 'Modificar', disponible: this.opcionDisponible('Modificar'), idEvento: 2 },
      { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 }
    ]

    this.setFiltrosComponent();
  }

  setFiltrosComponent() {
    this.filtros.push({
      activo: true,
      nombre: "Código",
      requerido: false,
      tipo: "input",
      filters: [{ filtro: "codigo", parametro: "" }],
      valores: [],
      tipoInput: "string"
    });
    this.filtros.push({
      activo: true,
      nombre: "Nombre",
      requerido: false,
      tipo: "input",
      filters: [{ filtro: "nombre", parametro: "" }],
      valores: [],
      tipoInput: "string"
    });
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

  eliminarItem(item: Reparacion) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el registro ${item.codigo} - ${item.nombre}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.s.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
          });
        }
      })
  }

}
