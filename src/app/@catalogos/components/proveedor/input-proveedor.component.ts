import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { first } from 'rxjs/operators';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ProveedorService } from '../../data/services/proveedor.service';
import { ProveedoresComponent } from './proveedores.component';

@Component({
  selector: 'app-input-proveedor',
  templateUrl: './input-proveedor.component.html',
  styleUrls: ['./input-proveedor.component.css']
})
export class InputProveedorComponent implements OnInit {

  @Output() getItem = new EventEmitter<any>();
  @Input() idItem;

  inputValue: string;
  label: string = "";
  buscarPor: string = "NIT";
  cargando: boolean = true;

  constructor(private proveedorService: ProveedorService, private sweetService: SweetService) { }

  ngOnInit(): void {
    this.proveedorService.getCargando().pipe(first(value => value === false)).subscribe(res => {
      this.cargando = false;
      if (this.idItem) {
        this.buscarId();
      }
    });
  }

  abrirModal() {
    this.proveedorService.cargarPagina().pipe(first()).subscribe();
    this.proveedorService.abrirModal(false, "Seleccione un Proveedor", ProveedoresComponent).subscribe(res => {
      if (res) {
        this.inputValue = res[0].entidadComercial.nit;
        this.label = `${res[0].codigo} - ${res[0].entidadComercial.nit} - ${res[0].entidadComercial.nombre} (${res[0].entidadComercial.razonSocial})`;
        this.getItem.emit(res[0]);
      }
    });
  }

  buscar() {
    switch (this.buscarPor) {
      case "NIT":
        this.buscarNIT();
        break;
      case "Código":
        this.buscarCodigo();
        break;
    }
  }

  buscarId() {
    this.proveedorService.getId(this.idItem).pipe(first()).subscribe(res => {
      this.label = `${res.codigo} - ${res.entidadComercial.nit} - ${res.entidadComercial.nombre} (${res.entidadComercial.razonSocial})`;
      this.inputValue = `${res.entidadComercial.nit}`
      this.getItem.emit(res);
    });
  }

  buscarNIT() {
    this.proveedorService.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.proveedorService.getNIT(this.inputValue, "", res.estacionTrabajo.sucursal.empresaId).pipe(first())
        .subscribe(res => {
          if (res.length > 0) {
            this.label = `${res[0].codigo} - ${res[0].entidadComercial.nit} - ${res[0].entidadComercial.nombre} (${res[0].entidadComercial.razonSocial})`;
            this.sweetService.sweet_notificacion("¡Listo!", 2000, 'success');
            this.getItem.emit(res[0]);
          } else {
            this.sweetService.sweet_alerta('Proveedor No Registrado', 'El proveedor no se encuentra registrado en el sistema', 'error');
            this.label = "";
            this.getItem.emit(null);
          }
        }, error => {
          this.label = "";
          this.getItem.emit(null);
        });
    });
  }

  buscarCodigo() {
    this.proveedorService.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.proveedorService.getNIT("", this.inputValue, res.estacionTrabajo.sucursal.empresaId).pipe(first())
        .subscribe(res => {
          if (res.length > 0) {
            this.label = `${res[0].codigo} - ${res[0].entidadComercial.nit} - ${res[0].entidadComercial.nombre} (${res[0].entidadComercial.razonSocial})`;
            this.sweetService.sweet_notificacion("¡Listo!", 2000, 'success');
            this.getItem.emit(res[0]);
          } else {
            this.sweetService.sweet_alerta('Proveedor No Registrado', 'El proveedor no se encuentra registrado en el sistema', 'error');
            this.label = "";
            this.getItem.emit(null);
          }
        }, error => {
          this.label = "";
          this.getItem.emit(null);
        });
    });
  }

}
