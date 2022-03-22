import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { InventarioCategoria } from '../../data/models/inventarioCategoria';
import { InventarioCategoriaService } from '../../data/services/inventario-categoria.service';

@Component({
  selector: 'app-inventario-categorias',
  templateUrl: './inventario-categorias.component.html',
  styleUrls: ['./inventario-categorias.component.css']
})
export class InventarioCategoriasComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  idEmpresa: number;

  private columnasDefault: Columna[] = [
    { nombre: '', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Descripción', targetId: 'descripcion', tipo: 'texto', aligment: 'left' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  constructor(private serviceComponent: InventarioCategoriaService, private router: Router,
    private sweetService: SweetService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando()
    ]).subscribe(() => this.validarPermiso());
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso('Consultar');
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    if (this.router.url.endsWith('invCategorias')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Categorias de Inventario',
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
        { icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible("Eliminar"), idEvento: 3 }
      ]);
    }
    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
      this.cargandoDatos = false;
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar la empresa", 'error');
      this.serviceComponent.paginaAnterior();
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

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  cargarPagina(noPagina: number) {
    this.serviceComponent.cargarPagina(noPagina, this.idEmpresa);
  }

  eliminarItem(item: InventarioCategoria) {
    this.sweetService
      .sweet_confirmacion(
        "¡Advertencia!",
        `¿Desea eliminar la categoria ${item.descripcion}?`,
        "warning"
      ).then((res) => {
        if (res.isConfirmed) {
          this.serviceComponent.eliminar(item.id).subscribe(res => {
            this.sweetService.sweet_notificacion(
              "Registro Eliminado",
              5000,
              "success"
            );
          });
        }
      });
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  getDatos() {
    return this.serviceComponent.getDatos();
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

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
