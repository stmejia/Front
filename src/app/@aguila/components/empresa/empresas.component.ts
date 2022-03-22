import { Router } from "@angular/router";
import { EmpresaService } from "./../../data/services/empresa.service";
import { SweetService } from "./../../../@page/services/sweet.service";
import { Component, OnInit } from "@angular/core";
import { Empresa } from "../../data/models/empresa";
import { first } from 'rxjs/operators';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { BaseComponent } from "src/app/@page/models/baseComponent";
import { ImagenRecursoConfiguracion } from "../../data/models/imagenRecursoConfiguracion";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-empresas",
  templateUrl: "./empresas.component.html",
  styleUrls: ["./empresas.component.css"],
})

export class EmpresasComponent extends BaseComponent<EmpresaService> implements OnInit {

  private imgRecursoConfigLogo: ImagenRecursoConfiguracion = null;
  constructor(protected sw: SweetService, protected s: EmpresaService, protected r: Router) {
    super("Empresas", s, sw);
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
    forkJoin([
      this.s.getImagenRecursoConfiguracion("ImagenPerfil")
    ]).pipe(first()).subscribe(res => {
      this.imgRecursoConfigLogo = res[0];
      this.cargarPantalla();
    }, (error) => {
      console.log(error);
      this.sw.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.cargarPantalla();
    });
  }

  cargarPantalla() {
    this.header.opciones.push({
      icono: 'add_circle_outline', nombre: 'Nuevo', disponible: this.opcionDisponible('Agregar'),
      idEvento: 2, toolTip: 'Agregar registro nuevo', color: 'primary'
    });

    this.columnasTabla = [
      { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'left', visible: true },
      { titulo: 'perm_media', target: ['imagenLogo', 'imagenDefault', 'urlImagen'], imgError: this.imgRecursoConfigLogo ? this.imgRecursoConfigLogo.urlImagenDefaul : 'assets/img/LogoApp.png', tipo: 'imagen', aligment: 'right', visible: true },
      { titulo: 'NIT', target: ['nit'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Nombre', target: ['nombre'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Abreviatura', target: ['abreviatura'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Estado', target: ['activ'], tipo: 'boolean', aligment: 'center', visible: true },
      { titulo: 'Teléfono', target: ['telefono'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Correo', target: ['email'], tipo: 'texto', aligment: 'left', visible: true },
      { titulo: 'Fecha de Creación', target: ['fchCreacion'], tipo: 'fecha', aligment: 'left', visible: true }
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
      nombre: "Nombre Empresa",
      valores: [],
      filters: [{ filtro: "nombre", parametro: "" }],
      tipo: "input",
      activo: true,
      requerido: false
    });
    this.queryFilters = [];
    this.cargandoDatosDelComponente = false;
  }

  eliminarItem(item: Empresa) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el registro ${item.abreviatura} - ${item.nombre}?`,
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
