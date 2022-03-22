import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { first, skip } from 'rxjs/operators';
import { AguilaTablaModalComponent } from 'src/app/@page/components/aguila-tabla-modal/aguila-tabla-modal.component';
import { EscanerQRComponent } from 'src/app/@page/components/escaner-qr/escaner-qr.component';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { QRDataModal, TablaModalData } from 'src/app/@page/models/modal';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Empleado } from '../../data/models/empleado';
import { EmpleadoService } from '../../data/services/empleado.service';

@Component({
  selector: 'app-input-empleado',
  templateUrl: './input-empleado.component.html',
  styleUrls: ['./input-empleado.component.css']
})
export class InputEmpleadoComponent implements OnInit, OnDestroy {

  @Output() getItem = new EventEmitter<Empleado | Empleado[]>();
  @Input() tituloModal: string = "Seleccione un colaborador";
  @Input() filtroAplicar: QueryFilter[] = [];
  @Input() filtrosComponent: FiltrosC[] = [];
  @Input() columnas: ColumnaTabla[] = [];
  @Input() multi: boolean = false;
  private sub: any;

  input: string = "";
  cargando: boolean = true;

  constructor(private service: EmpleadoService, private sweetService: SweetService) { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.service.getCargando().pipe(first(value => value === false)).subscribe(res => {
      this.cargarComponent();
    });
  }

  cargarComponent() {
    this.service.setDatos([]);
    this.cargando = false;
    this.sub = this.service.getDatos().pipe(skip(1)).subscribe(res => {
      if (res.length == 1) {
        this.getItem.emit(res[0]);
        this.input = res[0].codigo;
      } else {
        this.input = "";
        this.getItem.emit(null);
        this.sweetService.sweet_alerta("Error", "CUI de colaborador no existe.", "error");
      }
    });
  }

  abrirEscanerQR() {
    let dataModal: MatDialogConfig<QRDataModal> = {
      data: {
        controlador: this.service.getRecurso().controlador,
        campo: "codigo"
      }
    }
    this.service.abrirModal(EscanerQRComponent, dataModal).subscribe(res => {
      if (res) {
        let filtros = this.filtroAplicar.map(e => e);
        filtros.push({ filtro: "codigo", parametro: res })
        this.service.cargarPagina(filtros);
        // this.service.getCUI(res).subscribe(empleado => {
        //   this.getItem.emit(empleado);
        //   this.input = empleado.codigo;
        //   this.sweetService.sweet_notificacion("Listo");
        // }, (error) => {
        //   this.getItem.emit(null);
        //   this.sweetService.sweet_Error(error);
        // });
      }
    });
  }

  buscar() {
    let filtros = this.filtroAplicar.map(e => e);
    filtros.push({ filtro: "codigo", parametro: this.input })
    this.service.cargarPagina(filtros);
  }

  abrirModal() {
    let dataModal: MatDialogConfig<TablaModalData> = {
      data: {
        titulo: this.tituloModal,
        endPoint: this.service.getUrlEndPoint(),
        selectMultiple: this.multi,
        filtros: this.filtrosComponent,
        columnas: this.columnas,
        filtrosObligatorios: this.filtroAplicar
      }
    };

    this.service.abrirModal(AguilaTablaModalComponent, dataModal).subscribe(res => {
      if (res) {
        this.multi ? this.getItem.emit(res) : this.getItem.emit(res[0]);
        this.input = res[0].codigo;
      }
    });
  }
}
