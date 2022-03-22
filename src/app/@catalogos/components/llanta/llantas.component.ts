import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Llanta } from '../../data/models/llanta';
import { LlantaTiposService } from '../../data/services/llanta-tipos.service';
import { LlantaService } from '../../data/services/llanta.service';

@Component({
  selector: 'app-llantas',
  templateUrl: './llantas.component.html',
  styleUrls: ['./llantas.component.css']
})
export class LlantasComponent implements OnInit {

  cargandoDatos: boolean = true;
  rutaComponent: string = "";

  private columnasDefault: Columna[] = [
    { nombre: '', targetId: '', tipo: 'opcion', aligment: 'center' },
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Marca', targetId: 'marca', tipo: 'texto', aligment: 'left' },
    { nombre: 'Serie', targetId: 'serie', tipo: 'texto', aligment: 'left' },
    { nombre: 'Reencauche Ingreso', targetId: 'reencaucheIngreso', tipo: 'texto', aligment: 'left' },
    { nombre: 'Medidas', targetId: 'medidas', tipo: 'texto', aligment: 'left' },
    { nombre: 'Precio', targetId: 'precio', tipo: 'texto', aligment: 'left' },
    { nombre: 'Proposito Ingreso', targetId: 'propositoIngreso', tipo: 'texto', aligment: 'left' },
    { nombre: 'Fecha de Ingreso', targetId: 'fechaIngreso', tipo: 'fecha', aligment: 'left' },
    { nombre: 'Fecha de Baja', targetId: 'fechaBaja', tipo: 'fecha', aligment: 'left' },
    { nombre: 'Fecha de Creación', targetId: 'fechaCreacion', tipo: 'fecha', aligment: 'center' }
  ];

  filtros: QueryFilter[] = [
    { filtro: "PageNumber", parametro: "1" }, //0
    { filtro: "idLlantaTipo", parametro: "" }, //1
  ]

  constructor(private serviceComponent: LlantaService, private router: Router,
    private sweetService: SweetService, private tipoLlantaService: LlantaTiposService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando(),
      this.tipoLlantaService.getCargando().pipe(first(val => val === false)),
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
    if (this.router.url.endsWith('llantas')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: 'Llantas',
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
    this.tipoLlantaService.cargarPagina().subscribe();
    this.cargandoDatos = false;
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
    this.serviceComponent.cargarPagina(noPagina);
  }

  eliminarItem(item: Llanta) {
    this.sweetService
      .sweet_confirmacion(
        "¡Advertencia!",
        `¿Desea eliminar el registro de Llanta con Código: ${item.codigo}?`,
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

  getTiposLlanta() {
    return this.tipoLlantaService.getDatos();
  }

  cargarPaginaFiltros() {
    this.serviceComponent.getDatosFiltros(this.filtros).subscribe(res => {
      this.serviceComponent.setDatos(res);
      this.sweetService.sweet_notificacion("Listo", 1000, "info");
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
