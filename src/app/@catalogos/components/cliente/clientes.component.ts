import { ClienteService } from './../../data/services/cliente.service';
import { Component, OnInit } from '@angular/core';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Router } from '@angular/router';
import { Columna } from 'src/app/@page/models/columna';
import { first } from 'rxjs/operators';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { Cliente } from '../../data/models/cliente';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  cargandoDatos: boolean = true;
  noItems: number = 20;
  idEmpresa: number = -1;
  rutaComponent: string = "";

  private columnasDefault: Columna[] = [
    { nombre: 'settings', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'left' },
    { nombre: 'Doc. Identificación', targetOpt: ['entidadComercial', 'nit'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Nombre', targetOpt: ['entidadComercial', 'nombre'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Corporación', targetOpt: ['corporacion', 'nombre'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Tipo', targetOpt: ['tipoCliente', 'descripcion'], tipo: 'objeto', aligment: 'left' },
    //{ nombre: 'Tipo', targetId: 'vDireccionFiscal', tipo: 'texto', aligment: 'left' }, Pendiente de Agregar
    { nombre: 'Dirección', targetId: 'vDireccion', tipo: 'texto', aligment: 'left' },
    //{ nombre: 'Dirección Fiscal', targetId: 'vDireccionFiscal', tipo: 'texto', aligment: 'left' },
    { nombre: 'Dias de Crédito', targetId: 'diasCredito', tipo: 'texto', aligment: 'center' },
    { nombre: 'Fecha de Baja', targetId: 'fechaBaja', tipo: 'fecha', aligment: 'left' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  constructor(private serviceComponent: ClienteService, private sweetService: SweetService,
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
      case 3:
        this.eliminarItem(event.objeto);
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

  inactivar(cliente: Cliente) {
    this.sweetService.sweet_confirmacion("Inactivar Cliente", `¿Desea inactivar el Cliente ${cliente.entidadComercial.nombre}?`)
      .then(res => {
        if (res.isConfirmed) {
          this.serviceComponent.bloquear(cliente.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion("Cliente Inactivado");
          });
        }
      });
  }

  cargarComponent() {
    if (this.router.url.endsWith('clientes')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Clientes',
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
        //{ icono: 'delete_forever', nombre: 'Eliminar', disponible: this.opcionDisponible('Eliminar'), idEvento: 3 },
        { icono: 'lock', nombre: 'Inactivar', disponible: this.opcionDisponible('Inactivar'), idEvento: 4 }
      ]);
    }
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
      this.cargandoDatos = false;
    });
  }

  cargarPagina(noPagina: number, filtroNombre: string = "") {
    this.serviceComponent.cargarPagina(noPagina, this.idEmpresa);
  }

  eliminarItem(item: Cliente) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el Cliente ${item.entidadComercial.nombre}?`,
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
