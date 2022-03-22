import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Estados } from '../../data/models/estados';
import { EstadosService } from '../../data/services/estados.service';

@Component({
  selector: 'app-estados',
  templateUrl: './estados.component.html',
  styleUrls: ['./estados.component.css']
})
export class EstadosComponent implements OnInit {

  private subscriptions: Subscription = new Subscription();
  cargandoDatos: boolean = true;
  rutaComponent: string = "";
  idEmpresa: number = -1;
  tipo: string = "";

  private columnasDefault: Columna[] = [
    { nombre: '', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Nombre', targetId: 'nombre', tipo: 'texto', aligment: 'left' },
    { nombre: 'No. de orden', targetId: 'numeroOrden', tipo: 'texto', aligment: 'center' },
    { nombre: 'Disponible', targetId: 'disponible', tipo: 'boolean', aligment: 'center' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  constructor(private serviceComponent: EstadosService, private router: Router,
    private sweetService: SweetService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando()
    ]).subscribe(() => this.validarPermiso());
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.router.events.subscribe(val => {
        if (val instanceof NavigationEnd) {
          this.cargandoDatos = true;
          this.cargarComponent();
        }
      });
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso('Consultar');
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
    });

    this.serviceComponent.setDatos([]);

    this.tipo = this.activatedRoute.snapshot.paramMap.get("tipo");

    if (this.router.url.includes('/estados/')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Estados',
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
    }
  }

  eliminarItem(item: Estados) {
    this.sweetService.sweet_confirmacion(
      '¡Advertencia!',
      `¿Desea eliminar el Estado ${item.nombre}?`,
      'warning').then(res => {
        if (res.isConfirmed) {
          this.serviceComponent.eliminar(item.id).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion('Elemento Eliminado', 5000);
          });
        }
      })
  }

  cargarPagina(noPagina: number) {
    this.serviceComponent.cargarPagina(this.tipo, this.idEmpresa);
  }

  getColumnas() {
    return this.serviceComponent.getColumnas();
  }

  getDatos() {
    return this.serviceComponent.getDatos();
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
