import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { first, skip } from 'rxjs/operators';
import { AguilaTablaModalComponent } from 'src/app/@page/components/aguila-tabla-modal/aguila-tabla-modal.component';
import { EscanerQRComponent } from 'src/app/@page/components/escaner-qr/escaner-qr.component';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { QueryFilter, FiltrosC } from 'src/app/@page/models/filtros';
import { QRDataModal, TablaModalData } from 'src/app/@page/models/modal';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Reparacion } from '../../data/models/reparacion';
import { ReparacionService } from '../../data/services/reparacion.service';

@Component({
  selector: 'app-input-reparacion',
  templateUrl: './input-reparacion.component.html',
  styleUrls: ['./input-reparacion.component.css']
})
export class InputReparacionComponent implements OnInit, OnDestroy {

  @Output() getItem = new EventEmitter<Reparacion | Reparacion[]>();
  @Input() tituloModal: string = "Selecciones Una Reparación";
  @Input() filtroAplicar: QueryFilter[] = [];
  @Input() filtrosComponent: FiltrosC[] = [];
  @Input() columnas: ColumnaTabla[] = [];
  @Input() multi: boolean = false;
  private sub: any;

  input: string = "";
  cargando: boolean = true;

  constructor(private service: ReparacionService, private sweetService: SweetService) { }

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
        this.getItem.emit(res);
        this.input = res[0].codigo;
      } else {
        this.input = "";
        this.getItem.emit(null);
        this.sweetService.sweet_alerta("Error", "Codigo de reparación no existe", "error");
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
