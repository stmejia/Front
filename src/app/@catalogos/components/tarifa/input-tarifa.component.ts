import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { first } from 'rxjs/operators';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { TarifaService } from '../../data/services/tarifa.service';
import { TarifasComponent } from './tarifas.component';

@Component({
  selector: 'app-input-tarifa',
  templateUrl: './input-tarifa.component.html',
  styleUrls: ['./input-tarifa.component.css']
})
export class InputTarifaComponent implements OnInit {

  @Output() getItem = new EventEmitter<any>();
  @Input() idItem;
  @Input() titulo;

  inputValue: string;
  label: string = "";
  buscarPor: string = "Código";
  cargando: boolean = true;
  idEmpresa: number = 0;

  constructor(private service: TarifaService, private sweetService: SweetService) { }

  ngOnInit(): void {
    this.service.getCargando().subscribe(res => {
      this.service.getEstacionTrabajo().pipe(first()).subscribe(res => {
        this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
        this.cargando = false;
        if (this.idItem) {
          this.buscarId();
        }
      });
    });
  }

  buscarId() {
    this.service.getId(this.idItem).pipe(first()).subscribe(res => {
      this.label = `${res.codigo} - ${res.segmento} - ${res.precio}`;
      this.inputValue = `${res.codigo}`;
      this.getItem.emit(res);
    });
  }

  abrirModal() {
    this.service.abrirModal(false, "Seleccione Una Tarifa", TarifasComponent, this.idEmpresa).subscribe(res => {
      if (res) {
        this.inputValue = res[0].codigo;
        console.log(res);
        this.buscarPor = 'Código';
        this.label = `${res[0].codigo} - ${res[0].servicio.nombre} - ${res[0].precio}`;
        this.getItem.emit(res[0]);
      }
    });
  }

  buscar() {
    switch (this.buscarPor) {
      case "Código":
        let filtros: QueryFilter[] = [];
        filtros.push(
          { filtro: "idEmpresa", parametro: this.idEmpresa.toString() },
          { filtro: "codigo", parametro: this.inputValue }
        );
        this.buscarDato(filtros);
        break;
    }
  }

  buscarDato(filtros: QueryFilter[]) {
    this.service.getDatosFiltros(filtros).subscribe(res => {
      if (res.length > 0) {
        this.label = `${res[0].codigo} - ${res[0].segmento} - ${res[0].precio}`;
        this.sweetService.sweet_notificacion("Listo");
        this.getItem.emit(res[0]);
      } else {
        this.sweetService.sweet_alerta('Tarifa No Encontrada', 'No fue posible encontrar la tarifa', 'error');
        this.label = "";
        this.getItem.emit(null);
      }
    });
  }

}
