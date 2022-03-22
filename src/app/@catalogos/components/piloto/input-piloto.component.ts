import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { PilotoService } from '../../data/services/piloto.service';
import { EmpleadosComponent } from '../empleado/empleados.component';
import { PilotosComponent } from './pilotos.component';

@Component({
  selector: 'app-input-piloto',
  templateUrl: './input-piloto.component.html',
  styleUrls: ['./input-piloto.component.css']
})
export class InputPilotoComponent implements OnInit {

  @Output() getItem = new EventEmitter<any>();
  @Input() idItem;
  @Input() titulo;

  inputValue: string;
  label: string = "";
  buscarPor: string = "CP";
  cargando: boolean = true;

  constructor(private service: PilotoService, private sweetService: SweetService,) { }

  ngOnInit(): void {
    forkJoin([
      this.service.getCargando().pipe(first(val => val === false))
    ]).subscribe(res => {
      console.log(res);
      
      if (this.idItem) {
        this.buscarId();
      }
      this.cargando = false;
      console.log("ngOnInit", this.label.length);
    });
  }

  buscarId() {
    this.service.getId(this.idItem).pipe(first()).subscribe(res => {
      this.label = `${res.codigoPiloto} - ${res.idTipoPilotos}`;
      this.inputValue = `${res.idEmpleado}`;
      this.getItem.emit(res);
      console.log("buscarId", this.label.length);
    });
  }

  abrirModal() {
    this.service.abrirModal(false, "Seleccione un piloto", PilotosComponent).subscribe(res => {
      if (res) {
        this.inputValue = res[0].codigoPiloto;
        this.buscarPor = 'CP';
        this.label = `${res[0].codigoPiloto} - ${res[0].idTipoPilotos}`;
        this.getItem.emit(res[0]);
      }
    });
  }

  buscar() {
    switch (this.buscarPor) {
      case "CP":
        let filtros: QueryFilter[] = [];
        filtros.push(
          { filtro: "idEmpresa", parametro: this.service.getEmpresa().id },
          { filtro: "codigoPiloto", parametro: this.inputValue }
        );
        this.buscarDato(filtros);
        break;
      case "":
        break;
    }
  }

  buscarDato(filtros: QueryFilter[]) {
    this.service.getDatosFiltros(filtros).subscribe(res => {
      console.log(res);
      if (res.length > 0) {
        this.label = `${res[0].codigoPiloto} - ${res[0].idTipoPilotos}`;
        this.sweetService.sweet_notificacion("Listo");
        this.getItem.emit(res[0]);
      } else {
        this.sweetService.sweet_alerta('Vehículo No Encontrado', 'El vehículo no se encuentra registrado en el sistema', 'error');
        this.label = "";
        this.getItem.emit(null);
      }
    });
  }
}
