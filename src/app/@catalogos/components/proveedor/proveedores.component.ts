import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Proveedor } from '../../data/models/proveedor';
import { ProveedorService } from '../../data/services/proveedor.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {

  cargandoDatos: boolean = true;
  noItems: number = 20;
  rutaComponent: string = "";

  private columnasDefault: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'left' },
    { nombre: 'Doc. Identificación', targetOpt: ['entidadComercial', 'nit'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Nombre', targetOpt: ['entidadComercial', 'nombre'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Corporación', targetOpt: ['corporacion', 'nombre'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Tipo', targetOpt: ['tipoProveedor', 'descripcion'], tipo: 'objeto', aligment: 'left' },
    //{ nombre: 'Razón Social', targetOpt: ['entidadComercial', 'razonSocial'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Dirección', targetId: 'vDireccion', tipo: 'texto', aligment: 'left' },
    //{ nombre: 'Dirección Fiscal', targetId: 'vDireccionFiscal', tipo: 'texto', aligment: 'left' },
    { nombre: 'Fecha de Baja', targetId: 'fechaBaja', tipo: 'fecha', aligment: 'left' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  constructor(private serviceComponent: ProveedorService, private sweetService: SweetService,
    private router: Router) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.validarPermiso();
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
      case 4:
        this.inactivar(event.objeto);
        break;
    }
  }

  eventoBuscador(event: string) {
    this.cargarPagina(1, event)
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina, event.filtro);
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso();
      this.serviceComponent.paginaAnterior();
    }
  }

  inactivar(item: Proveedor) {
    this.sweetService.sweet_confirmacion("Inactivar Proveedor", `¿Desea inactivar el Proveedor ${item.entidadComercial.nombre}?`)
      .then(res => {
        if (res.isConfirmed) {
          this.serviceComponent.bloquear(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion("Proveedor Inactivado");
          });
        }
      });
  }

  cargarComponent() {
    if (this.router.url.endsWith('proveedores')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Proveedores',
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
        { icono: 'lock', nombre: 'Inactivar', disponible: this.opcionDisponible('Inactivar'), idEvento: 4 }
        //{ icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 }
      ]);
    }
    this.cargandoDatos = false;
  }

  cargarPagina(noPagina: number, filtroNombre: string = "") {
    this.cargandoDatos = true;
    this.serviceComponent.cargarPagina(noPagina).pipe(
      first(value => value != null)
    ).subscribe(res => {
      this.cargandoDatos = false;
    });
  }

  eliminarItem(item: Proveedor) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el Proveedor ${item.entidadComercial.nombre}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.serviceComponent.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
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
