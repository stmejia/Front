import { Component, OnInit } from "@angular/core";
import { SucursalService } from "../../data/services/sucursal.service";
import { Sucursal } from "../../data/models/sucursal";
import { SweetService } from "src/app/@page/services/sweet.service";
import { Router } from '@angular/router';
import { first } from "rxjs/operators";
import { EventoMenuOpciones } from "src/app/@page/models/menu";
import { OpcionesHeaderComponent } from "src/app/@page/models/headers";
import { BaseComponent } from "src/app/@page/models/baseComponent";

@Component({
  selector: "app-sucursales",
  templateUrl: "./sucursales.component.html",
  styleUrls: ["./sucursales.component.css"],
})
export class SucursalesComponent extends BaseComponent implements OnInit {

  constructor(protected sw: SweetService, protected s: SucursalService, protected r: Router) {
    super("Sucursales", s, sw);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 2:
        this.service.navegar([this.rutaComponent, '']);
        break;
    }
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.service.navegar([this.rutaComponent, event.objeto.id]);
        break;
      case 2:
        this.service.navegar([this.rutaComponent, event.objeto.id]);
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
      { titulo: 'Dirección', target: ['direccion'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Activa', target: ['activa'], tipo: 'boolean', aligment: 'center', visible: true },
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

  eliminarItem(item: Sucursal) {
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