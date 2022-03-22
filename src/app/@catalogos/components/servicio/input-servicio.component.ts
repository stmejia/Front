import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ServicioService } from '../../data/services/servicio.service';
import { ServiciosComponent } from './servicios.component';

@Component({
  selector: 'app-input-servicio',
  templateUrl: './input-servicio.component.html',
  styleUrls: ['./input-servicio.component.css']
})
export class InputServicioComponent implements OnInit {

  @Output() getItem = new EventEmitter<any>();
  @Input() idItem;
  @Input() titulo;

  inputValue: string;
  label: string = "";
  buscarPor: string = "Código";
  cargando: boolean = true;
  idEmpresa: number = 0;

  constructor(private service: ServicioService, private sweetService: SweetService) { }

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
      this.label = `${res.codigo} - ${res.nombre} - ${res.precio}`;
      this.inputValue = `${res.codigo}`;
      this.getItem.emit(res);
    });
  }

  abrirModal() {
    this.service.abrirModal(false, "Seleccione un Servicio", ServiciosComponent).subscribe(res => {
      if (res) {
        this.inputValue = res[0].codigo;
        this.buscarPor = 'Código';
        this.label = `${res[0].codigo} - ${res[0].nombre} - ${res[0].precio}`;
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
        this.label = `${res[0].codigo} - ${res[0].nombre} - ${res[0].precio}`;
        this.sweetService.sweet_notificacion("Listo");
        this.getItem.emit(res[0]);
      } else {
        this.sweetService.sweet_alerta('Servicio No Encontrado', 'No fue posible encontrar el servicio', 'error');
        this.label = "";
        this.getItem.emit(null);
      }
    });
  }
}
