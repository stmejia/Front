import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { InspeccionIngresoVehiculo } from '../../data/models/condicionTallerVehiculo';
import { InspeccionIngresoVehiculosService } from '../../data/services/inspeccion-ingreso-vehiculos.service';

@Component({
  selector: 'app-inspeccion-ingreso-vehiculos',
  templateUrl: './inspeccion-ingreso-vehiculos.component.html',
  styleUrls: ['./inspeccion-ingreso-vehiculos.component.css']
})
export class InspeccionIngresoVehiculosComponent extends BaseComponent implements OnInit {

  constructor(protected sw: SweetService, protected s: InspeccionIngresoVehiculosService, protected r: Router) {
    super("Condiciones De Ingreso De Vehículos", s, sw);
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
    this.cargarPantalla();
  }

  cargarPantalla() {
    this.header.opciones.push({
      icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
      idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
    });

    this.columnasTabla = [
      { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'left', visible: true },
      { titulo: 'Serie', target: ['serie'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'No.', target: ['numero'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Fecha De Ingreso', target: ['fechaIngreso'], tipo: 'fecha', aligment: 'center', visible: true },
      { titulo: 'Fecha De Salida', target: ['fechaSalida'], tipo: 'fecha', aligment: 'center', visible: true },
      { titulo: 'Fecha De Aprobación', target: ['fechaAprobacion'], tipo: 'fecha', aligment: 'center', visible: true },
      { titulo: 'Fecha De Rechazo', target: ['fechaRechazo'], tipo: 'fecha', aligment: 'center', visible: true },
      { titulo: 'Fecha de Creación', target: ['fechaCreacion'], tipo: 'fecha', aligment: 'left', visible: true }
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
      nombre: "Serie De Documento",
      valores: [],
      filters: [{ filtro: "serie", parametro: "" }],
      tipo: "input",
      activo: true,
      requerido: false
    });
    this.filtros.push({
      nombre: "No. De Documento",
      valores: [],
      filters: [{ filtro: "numero", parametro: "" }],
      tipo: "input",
      activo: true,
      requerido: false
    });
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false; 
  }

  eliminarItem(item: InspeccionIngresoVehiculo) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el registro ${item.serie} - ${item.numero}?`,
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
