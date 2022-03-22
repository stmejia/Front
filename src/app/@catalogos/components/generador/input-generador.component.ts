import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { first, skip } from 'rxjs/operators';
import { AguilaTablaModalComponent } from 'src/app/@page/components/aguila-tabla-modal/aguila-tabla-modal.component';
import { EscanerQRComponent } from 'src/app/@page/components/escaner-qr/escaner-qr.component';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { QRDataModal, TablaModalData } from 'src/app/@page/models/modal';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Generador } from '../../data/models/generador';
import { GeneradorService } from '../../data/services/generador.service';

@Component({
  selector: 'app-input-generador',
  templateUrl: './input-generador.component.html',
  styleUrls: ['./input-generador.component.css']
})
export class InputGeneradorComponent implements OnInit {

  @Output() getItem = new EventEmitter<Generador | Generador[]>();
  @Input() tituloModal: string = "Seleccione Un Generador";
  @Input() filtroAplicar: QueryFilter[] = [];
  @Input() filtrosComponent: FiltrosC[] = [];
  @Input() columnas: ColumnaTabla[] = [];
  @Input() multi: boolean = false;

  input: string = "";
  cargando: boolean = true;
  private sub: any;

  constructor(private service: GeneradorService, private sweetService: SweetService) { }

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
        this.input = res[0].activoOperacion.codigo;
      } else {
        this.getItem.emit(null);
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
        filtros.push({ filtro: "codigo", parametro: res });
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
        this.input = res[0].activoOperacion.codigo;
      }
    });
  }

}
