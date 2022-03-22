import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Producto } from '../../data/models/producto';
import { ProductoService } from '../../data/services/producto.service';
import { ConfiguracionBodegaComponent } from './configuracion-bodega.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";

  private columnasDefault: Columna[] = [
    { nombre: '', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Descripción', targetId: 'descripcion', tipo: 'texto', aligment: 'left' },
    { nombre: 'Tipo', targetId: 'bienServicio', tipo: 'texto', aligment: 'center' },
    { nombre: 'Medida', targetId: 'nombreMedida', tipo: 'texto', aligment: 'center' },
    { nombre: 'Categoria', targetId: 'descCategoria', tipo: 'texto', aligment: 'center' },
    { nombre: 'Sub Categoria', targetId: 'descSubCategoria', tipo: 'texto', aligment: 'center' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  constructor(private serviceComponent: ProductoService, private router: Router,
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
    if (this.router.url.endsWith('productos')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Productos',
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
        { icono: 'archive', nombre: 'Configurar Bodega', disponible: this.opcionDisponible('Config. Bodega'), idEvento: 3 },
        { icono: 'print', nombre: 'Imprimir Etiqueta', disponible: this.opcionDisponible('Imprimir'), idEvento: 4 },
        //{ icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible("Eliminar"), idEvento: 3 }
      ]);
    }
    this.cargandoDatos = false;
    this.serviceComponent.getDatos().subscribe(res => console.log(res));
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
        this.configurarBodega(event.objeto);
        break;
      case 4:
        this.serviceComponent.imprimirEtiqueta(event.objeto);
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  cargarPagina(noPagina: number) {
    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      this.serviceComponent.cargarPagina(noPagina, res.estacionTrabajo.sucursal.empresaId);
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

  getEstacionTrabajo() {
    return this.serviceComponent.getEstacionTrabajo();
  }

  getMenuOpcionesTabla() {
    return this.serviceComponent.getMenuOpcionesTabla();
  }

  configurarBodega(producto: Producto) {
    this.serviceComponent.setProducto(producto);
    this.serviceComponent.configurarBodega(ConfiguracionBodegaComponent);
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

}
