import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { first } from 'rxjs/operators';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Cliente } from '../../data/models/cliente';
import { ClienteService } from '../../data/services/cliente.service';
import { TarifaService } from '../../data/services/tarifa.service';
import { ClientesComponent } from './clientes.component';

@Component({
  selector: 'app-input-cliente',
  templateUrl: './input-cliente.component.html',
  styleUrls: ['./input-cliente.component.css']
})
export class InputClienteComponent implements OnInit {

  @Output() getItem = new EventEmitter<any>();
  @Input() idItem;
  @Input() titulo;

  inputValue: string;
  label: string = "";
  buscarPor: string = "Código";
  cargando: boolean = true;
  idEmpresa: number = 0;

  constructor(private service: ClienteService, private sweetService: SweetService) { }

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
      this.label = `${res.codigo} - ${res.diasCredito}`;
      this.inputValue = `${res.codigo}`;
      this.getItem.emit(res);
    });
  }

  abrirModal() {
    this.service.abrirModal(false, "Seleccione un Cliente", ClientesComponent, this.idEmpresa).subscribe((res: Cliente[]) => {
      if (res) {
        this.inputValue = res[0].codigo;
        this.buscarPor = 'Código';
        this.label = `${res[0].codigo} - ${res[0].entidadComercial.nombre}`;
        this.getItem.emit(res[0]);
      }
    });
  }

  buscar() {
    if (this.inputValue.length > 0) {
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
  }

  buscarDato(filtros: QueryFilter[]) {
    this.service.getDatosFiltros(filtros).subscribe(res => {
      if (res.length > 0) {
        this.label = `${res[0].codigo} - ${res[0].entidadComercial.nombre}`;
        this.sweetService.sweet_notificacion("Listo");
        this.getItem.emit(res[0]);
      } else {
        this.sweetService.sweet_alerta('Cliente No Encontrado', 'No fue posible encontrar el cliente', 'error');
        this.label = "";
        this.getItem.emit(null);
      }
    });
  }

}
