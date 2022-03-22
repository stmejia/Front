import { SimpleChanges } from '@angular/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { EscanerQRComponent } from 'src/app/@page/components/escaner-qr/escaner-qr.component';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { LlantaService } from '../../data/services/llanta.service';
import { LlantasComponent } from './llantas.component';

@Component({
  selector: 'app-input-llanta',
  templateUrl: './input-llanta.component.html',
  styleUrls: ['./input-llanta.component.css']
})
export class InputLlantaComponent implements OnInit {

  @Output() getItem = new EventEmitter<any>();
  @Input() idItem;
  @Input() titulo;
  @Input() codigo = "";

  inputValue: string = "";
  label: string = "";
  buscarPor: string = "Código";
  cargando: boolean = true;
  idEmpresa: number = 0;
  requerido: boolean = true;

  constructor(private service: LlantaService, private sweetService: SweetService) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(v => v == false)),
    ]).subscribe(res => {
      this.cargando = false;
      if (this.idItem) {
        this.buscarId();
      }
      if (this.codigo) {
        if (this.codigo.length > 0) {
          let filtros: QueryFilter[] = [];
          filtros.push(
            { filtro: "codigo", parametro: this.codigo }
          );
          this.buscarDato(filtros);
        }
      }
    });
  }

  ngOnChanges(cambios: SimpleChanges) {
    if (cambios.codigo) {
      if (!cambios.codigo.firstChange) {
        if (cambios.codigo.currentValue) {
          if (cambios.codigo.currentValue.toString().length > 0) {
            let filtros: QueryFilter[] = [];
            filtros.push(
              { filtro: "codigo", parametro: cambios.codigo.currentValue }
            );
            this.buscarDato(filtros);
          } else {
            this.inputValue = "";
            this.label = "";
            this.requerido = true;
            this.getItem.emit(null);
          }
        }
      }
    }
    if (cambios.idItem) {
      if (!cambios.idItem.firstChange) {
        this.buscarId();
      }
    }
  }

  buscarId() {
    this.service.getId(this.idItem).pipe(first()).subscribe(res => {
      this.label = `${res.codigo} - ${res.marca}`;
      this.inputValue = `${res.codigo}`;
      this.getItem.emit(res);
      this.requerido = false;
    });
  }

  abrirModal() {
    this.service.abrirModal(false, "Seleccione Una Llanta", LlantasComponent).subscribe(res => {
      if (res) {
        this.inputValue = res[0].codigo;
        this.buscarPor = 'Código';
        this.label = `${res[0].codigo} - ${res[0].marca}`;
        this.getItem.emit(res[0]);
      }
    });
  }

  abrirEscanerQR() {
    this.service.abrirComponenteModal(EscanerQRComponent).subscribe(res => {
      let filtros = [];
      filtros.push(
        { filtro: "idEmpresa", parametro: this.idEmpresa.toString() },
        { filtro: "codigo", parametro: res }
      );
      this.inputValue = res;
      this.buscarPor = "Código"
      this.buscarDato(filtros);
    });
  }

  buscar() {
    let filtros: QueryFilter[] = [];
    if (this.inputValue.trim().length > 0) {
      switch (this.buscarPor) {
        case "marca":
          filtros = [];
          filtros.push(
            //{ filtro: "idEmpresa", parametro: this.idEmpresa.toString() },
            { filtro: "marca", parametro: this.inputValue }
          );
          this.buscarDato(filtros);
          break;
        case "Código":
          filtros = [];
          filtros.push(
            //{ filtro: "idEmpresa", parametro: this.idEmpresa.toString() },
            { filtro: "codigo", parametro: this.inputValue }
          );
          this.buscarDato(filtros);
          break;
      }
    } else {
      this.inputValue = "";
      this.label = "";
      this.requerido = true;
      this.getItem.emit(null);
    }
  }

  buscarDato(filtros: QueryFilter[]) {
    this.service.getDatosFiltros(filtros).subscribe(res => {
      if (res.length == 1) {
        this.label = `${res[0].codigo} - ${res[0].marca}`;
        this.inputValue = res[0].codigo;
        this.sweetService.sweet_notificacion("Listo");
        this.getItem.emit(res[0]);
        this.requerido = false;
      } else {
        this.sweetService.sweet_alerta('Llanta No Registrada', 'La llanta no se encuentra registrada en el sistemas', 'error');
        this.label = "";
        this.getItem.emit(null);
        this.requerido = true;
      }
    });
  }
}
