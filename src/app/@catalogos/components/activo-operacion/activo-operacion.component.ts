import { Location } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ActivoOperaciones } from '../../data/models/activoOperaciones';
import { Lista } from '../../data/models/lista';
import { TipoLista } from '../../data/models/tipoLista';
import { ActivoOperacionService } from '../../data/services/activo-operacion.service';
import { ListaService } from '../../data/services/lista.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';
import { TransporteService } from '../../data/services/transporte.service';

@Component({
  selector: 'app-activo-operacion',
  templateUrl: './activo-operacion.component.html',
  styleUrls: ['./activo-operacion.component.css']
})

export class ActivoOperacionComponent implements OnInit, OnChanges {

  @Input() objeto: ActivoOperaciones;
  @Input() errores: any[];
  @Output() activoOperacion = new EventEmitter();

  cargando: boolean = true;

  codErrores = {
    fechaBaja: "*Campo Requerido",
    categoria: "*Campo Requerido",
    color: "*Campo Requerido",
    marca: "*Campo Requerido",
    vin: "*Campo Requerido",
    serie: "*Campo Requerido",
    modeloAnio: "*Campo Requerido, el valor minimo es 1950",
    correlativo: "*Campo Requerido",
    idTransporte: "*Campo Requerido",
    descripcion: "*Campo Requerido"
  };

  colTransportes: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", tipo: "texto" },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", tipo: "texto" }
  ];

  form: FormGroup;
  TL_Flota: TipoLista;
  listaFlota: Lista[] = [];
  idEmpresa: number;

  constructor(private sweetService: SweetService, private formBuilder: FormBuilder, private transporteService: TransporteService,
    private location: Location, private activoOperacionService: ActivoOperacionService, private tipoListaService: TipoListaService,
    private listaService: ListaService) { }

  ngOnInit(): void {
    forkJoin([
      this.transporteService.getCargando(),
      this.activoOperacionService.getCargando().pipe(first(val => val === false))
    ]).subscribe(res => {
      this.cargarComponent();
    });
  }

  ngOnChanges(cambios: SimpleChanges) {
    console.log(cambios);
    
    if (cambios.objeto) {
      if (!cambios.objeto.firstChange) {
        this.cargarDatos();
      }
    }
    if (cambios.errores) {
      if (!cambios.errores.firstChange) {
        console.log(cambios.errores.currentValue);
        this.erroresValidacion(cambios.errores.currentValue);
        this.form.markAllAsTouched();
      }
    }
  }

  cargarComponent() {
    this.cargarTipoListas();
  }

  cargarDatos() {
    this.habilitarInputs();
    if (this.objeto) {
      this.form.patchValue(this.objeto);
      this.bloquearInputs();
    }else{
      this.form.reset();
      this.form.controls["idEmpresa"].setValue(this.activoOperacionService.getEmpresa().id);
      this.form.controls["id"].setValue(0);
      this.form.controls["fechaCreacion"].setValue(new Date());
      this.form.controls["idActivoGenerales"].setValue(0);
    }
    this.cargando = false;
    this.bloquearInputs();

  }

  cargarTipoListas() {
    this.tipoListaService.getIdRecursoCampo(this.activoOperacionService.getRecurso().id, "flota")
      .pipe(first()).subscribe(res => {
        this.TL_Flota = res[0];
        this.cargarListas();
      });
  }

  cargarListas() {
    this.listaService.cargarPagina(this.TL_Flota.id, this.activoOperacionService.getEmpresa().id)
      .pipe(first()).subscribe(res => {
        this.listaFlota = res;
        this.transporteService.cargarPagina().pipe(first()).subscribe();
        this.idEmpresa = this.activoOperacionService.getEmpresa().id;
        this.configurarFormulario();
      });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      id: [0],
      idEmpresa: [this.idEmpresa],
      codigo: [""],
      descripcion: [""],
      idActivoGenerales: [0],
      fechaCreacion: [new Date],
      fechaBaja: [""],
      categoria: [""],
      color: [""],
      marca: [""],
      vin: [""],
      correlativo: ["", [Validators.max(9999)]],
      serie: [""],
      modeloAnio: [""],
      idTransporte: [""],
      flota: [""],
      coc: [""],
      transporte: [""]
    });
    //this.form = this.objeto;
    //this.cargando = false;
    this.cargarDatos();
  }

  bloquearInputs() {
    this.form.controls['fechaCreacion'].disable();
    this.form.controls['fechaBaja'].disable();
  }

  habilitarInputs() {
    this.form.controls['fechaCreacion'].enable();
    this.form.controls['fechaBaja'].enable();
  }

  enviarObjeto() {
    this.habilitarInputs();
    if (this.form.valid) {
      this.activoOperacion.emit(this.form.value);
      this.form.markAllAsTouched();
      this.bloquearInputs();
    } else {
      this.activoOperacion.emit(null);
      this.bloquearInputs();
    }
  }

  getTransportes() {
    return this.transporteService.getDatos();
  }

  erroresValidacion(validaciones: any) {
    for (const validacion in validaciones) {
      var error = validaciones[validacion];
      for (const codError in this.codErrores) {
        if (validacion.toLowerCase().trim() === codError.toLowerCase().trim()) {
          this.codErrores[codError] = error;
          this.form.get(codError).setErrors(["api"]);
          this.form.markAllAsTouched();
        }
      }
    }
  }

}
