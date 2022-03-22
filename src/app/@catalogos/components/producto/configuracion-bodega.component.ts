import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Columna } from 'src/app/@page/models/columna';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Producto } from '../../data/models/producto';
import { ProductoBodega } from '../../data/models/productoBodega';
import { ProductoBodegaService } from '../../data/services/producto-bodega.service';
import { ProductoService } from '../../data/services/producto.service';

@Component({
  selector: 'app-configuracion-bodega',
  templateUrl: './configuracion-bodega.component.html',
  styleUrls: ['./configuracion-bodega.component.css']
})
export class ConfiguracionBodegaComponent implements OnInit {

  cargandoDatos: boolean = true;
  producto: Producto;
  productoBodega: ProductoBodega;
  form: FormGroup;
  estacionesTrabajo: Estaciontrabajo[] = [];
  mostrarCampos: boolean = false;
  idBodega: number;
  idEmpresa: number = -1;

  colEstacionTrabajo: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", tipo: "texto" },
    { nombre: "Bodega", aligment: "center", targetId: "nombre", tipo: "texto" },
    { nombre: "Sucursal", aligment: "center", targetOpt: ["sucursal", "nombre"], tipo: "objeto" },
    { nombre: "Empresa", aligment: "center", targetOpt: ["sucursal", "empresa", "abreviatura"], tipo: "objeto" },
  ]

  constructor(private serviceComponent: ProductoBodegaService, private productoService: ProductoService,
    private formBuilder: FormBuilder, private sweetService: SweetService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando(),
      this.productoService.getCargando(),
    ]).subscribe(() => this.validarPermiso());
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar') ||
      this.serviceComponent.validarPermiso('Agregar') ||
      this.serviceComponent.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Agregar - Modificar - Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  cargarComponent() {
    this.productoService.getProducto().pipe(first(val => val != null)).subscribe(res => {
      if (res) {
        this.producto = res;
        this.productoService.getEstacionTrabajo().subscribe(res => {
          this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
          this.cargarEstacionesTrabajo();
        });
      } else {
        // Cerrar Modal
      }
    });
  }

  cargarEstacionesTrabajo() {
    forkJoin([
      this.serviceComponent.getEstacionesTrabajo().pipe(first()),
      this.serviceComponent.getEstacionTrabajo(),
    ]).subscribe(res => {
      for (let asigEstacion of res[0]) {
        this.estacionesTrabajo.push(asigEstacion.estacionTrabajo);
      }
      this.estacionesTrabajo.push(res[1].estacionTrabajo);
      //Filtramos las estaciones de trabajo para que se muestren solo las de tipo Bodega
      //Y que esten dentro de la empresa donde se estan trabajando
      this.estacionesTrabajo = this.estacionesTrabajo.filter(item => item.tipo.toLocaleLowerCase() == "bodega" && item.sucursal.empresaId == this.idEmpresa);
      this.configurarFormulario();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      id: [0],
      idBodega: [""],
      idProducto: [""],
      pasillo: ["", [Validators.required]],
      estante: ["", [Validators.required]],
      nivel: ["", [Validators.required]],
      lugar: ["", [Validators.required]],
      maximo: ["", [Validators.required]],
      minimo: ["", [Validators.required]],
      estacionTrabajo: [""],
      fechaCreacion: [new Date()]
    });
    this.cargandoDatos = false;
  }

  selectBodega(idBodega) {
    this.idBodega = idBodega;
    this.form.controls['idBodega'].setValue(idBodega);
    this.buscarDatos();
  }

  buscarDatos() {
    this.mostrarCampos = false;
    let filtros: QueryFilter[] = [];
    filtros.push({ filtro: "idBodega", parametro: this.form.controls['idBodega'].value });
    filtros.push({ filtro: "idProducto", parametro: this.producto.id });

    this.serviceComponent.getXFiltros(filtros).subscribe(res => {
      if (res.length > 0) {
        this.form.setValue(res[0]);
      } else {
        this.form.reset();
        this.form.controls['id'].setValue(0);
        this.form.controls['idBodega'].setValue(this.idBodega);
        this.form.controls['idProducto'].setValue(this.producto.id);
        this.form.controls['fechaCreacion'].setValue(new Date());
      }
      this.mostrarCampos = true;
    });
  }

  guardarRegistro() {
    if (this.form.valid) {
      if (this.form.controls['id'].value > 0) {
        this.serviceComponent.modificar(this.form.value).subscribe(res => {
          this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        }, (error) => {
          this.sweetService.sweet_alerta("Error", "Error al actualizar el registro", 'error');
        });
      } else {
        this.serviceComponent.crear(this.form.value).subscribe(res => {
          this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        }, (error) => {
          this.sweetService.sweet_alerta("Error", "Error al actualizar el registro", 'error');
        });
      }
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos", "error");
      this.form.markAllAsTouched();
    }
  }
}
