import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { EquipoRemolque } from '../../data/models/equipoRemolque';
import { EquipoRemolqueService } from '../../data/services/equipo-remolque.service';
import { EquiposRemolqueComponent } from './equipos-remolque.component';

@Component({
  selector: 'app-input-equipo',
  templateUrl: './input-equipo.component.html',
  styleUrls: ['./input-equipo.component.css']
})
export class InputEquipoComponent implements OnInit {

  @Output() getItem = new EventEmitter<any>();
  @Input() idItem;
  @Input() titulo;

  inputValue: string = "";
  label: string = "";
  buscarPor: string = "Código";
  cargando: boolean = true;

  constructor(private service: EquipoRemolqueService, private sweetService: SweetService) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(val => val === false))
    ]).subscribe(res => {
      if (this.idItem) {
        this.buscarId();
      }
      this.cargando = false;
    });
  }

  buscarId() {
    this.service.getId(this.idItem).pipe(first()).subscribe(res => {
      this.label = `${res.placa} - ${res.idActivo}`;
      this.inputValue = `${res.placa}`;
      this.getItem.emit(res);
    });
  }

  abrirModal() {
    this.service.abrirModal(EquiposRemolqueComponent).subscribe((res: EquipoRemolque[]) => {
      if (res) {
        this.inputValue = res[0].activoOperacion.codigo;
        this.buscarPor = 'Código';
        this.label = `${res[0].activoOperacion.codigo} - ${res[0].activoOperacion.descripcion} - ${res[0].placa}`;
        this.getItem.emit(res[0]);
      }
    });
  }

  buscar() {
    if (this.inputValue.trim().length > 0) {
      let filtros: QueryFilter[] = [];

      switch (this.buscarPor) {
        case "Código":
          filtros.push(
            { filtro: "codigo", parametro: this.inputValue }
          );
          this.buscarDato(filtros);
          break;
      }
    }
  }

  buscarDato(filtros: QueryFilter[]) {
    this.service.getDatosFiltros(filtros).subscribe(res => {
      if (res.length > 0) {
        this.label = `${res[0].activoOperacion.codigo} - ${res[0].activoOperacion.descripcion} - ${res[0].placa}`;
        this.sweetService.sweet_notificacion("Listo");
        this.getItem.emit(res[0]);
      } else {
        this.sweetService.sweet_alerta('Equipo No Encontrado', 'El equipo no se encuentra registrado en el sistema', 'error');
        this.label = "";
        this.getItem.emit(null);
      }
    });
  }
}
