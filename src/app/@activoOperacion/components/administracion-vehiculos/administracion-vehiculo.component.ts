import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Vehiculo } from 'src/app/@catalogos/data/models/vehiculo';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { EventoPaginador, Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ControlVehiculosService } from '../../data/services/control-vehiculos.service';

@Component({
  selector: 'app-administracion-vehiculo',
  templateUrl: './administracion-vehiculo.component.html',
  //styleUrls: ['./administracion-vehiculo.component.css']
})
export class AdministracionVehiculoComponent implements OnInit {

  cargando: boolean = true;
  rutaComponent: string = "";
  vehiculo: Vehiculo = null;
  columnasTabla: ColumnaTabla[] = [
    { titulo: "Fecha Movimiento", target: ["fechaCreacion"], tipo: "fecha", aligment: "left", visible: true },
    { titulo: "Predio", target: ["estacionTrabajo", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Estado", target: ["estado", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Disponible", target: ["estado", "disponible"], tipo: "boolean", aligment: "center", visible: true },
    { titulo: "Documento", target: ["documento"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Ruta", target: ["ruta", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Piloto", target: ["piloto", "nombres"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Observaciones", target: ["observaciones"], tipo: "texto", aligment: "left", visible: true },
  ]

  listaMovimientos = new BehaviorSubject<any[]>([]);
  paginador = new BehaviorSubject<Paginador>(null);
  header: ItemHeaderComponent = {
    titulo: 'Administración De Vehículo',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  constructor(private serviceComponent: ControlVehiculosService,
    private activatedRoute: ActivatedRoute, private sweetService: SweetService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(value => value === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventoPaginador(evento: EventoPaginador) {
    this.cargarPagina(evento.noPagina);
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.serviceComponent.paginaAnterior();
        break;
    }
  }

  cargarComponent() {
    if (this.isNuevo()) {
      this.serviceComponent.paginaAnterior();
    } else {
      this.serviceComponent.setConfiguracionComponent({
        header: this.header,
        isModal: false
      });
      this.cargarDatos();
    }
  }

  cargarDatos() {
    forkJoin([
      this.serviceComponent.getId(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id"))),
    ]).subscribe(res => {
      this.vehiculo = res[0];
      this.cargarPagina(1);
      this.cargando = false;
    });
  }

  cargarPagina(noPagina) {
    this.serviceComponent.getMovimientosEquipo(this.vehiculo.idActivo, noPagina)
      .subscribe((res) => {
        this.listaMovimientos.next(res.aguilaData);
        this.sweetService.sweet_notificacion("Listo");
        this.configurarPaginador(res);
      });
  }

  configurarPaginador(res: any) {
    var pa: number[] = [];
    for (let i = res.meta.currentPage - 2; i <= res.meta.currentPage + 2; i++) {
      if (i > 0 && i <= res.meta.totalPages) {
        pa.push(i);
      }
    }
    let paginador = res.meta as Paginador;
    paginador.paginas = pa;
    this.paginador.next(paginador);
    this.cargando = false;
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

}
