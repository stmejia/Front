import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Columna } from 'src/app/@page/models/columna';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { TipoActivosService } from '../../data/services/tipo-activos.service';

@Component({
  selector: 'app-activo-general',
  templateUrl: './activo-general.component.html',
  styleUrls: ['./activo-general.component.css']
})
export class ActivoGeneralComponent implements OnInit {

  @Input() errores;
  @Output() activoGeneral = new EventEmitter();

  cargando: boolean = true;

  codErrores = {
    fechaCompra: "*Campo Requerido",
    valorCompra: "*Campo Requerido",
    valorLibro: "*Campo Requerido",
    valorRescate: "*Campo Requerido",
    fechaBaja: "*Campo Requerido",
    depreciacionAcumulada: "*Campo Requerido",
    idDocumentoCompra: "*Campo Requerido",
    idTipoActivo: "*Campo Requerido",
    tituloPropiedad: "*Campo Requerido",
    polizaImportacion: "*Campo Requerido"
  };

  colTipoActivo: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo" },
    { nombre: "Nombre", aligment: "left", targetId: "nombre" }
  ];

  form: FormGroup;

  constructor(private sweetService: SweetService, private formBuilder: FormBuilder, private tipoActivoService: TipoActivosService,
    private location: Location) { }

  ngOnInit(): void {
    this.tipoActivoService.getCargando().subscribe(res => {
      this.cargarComponent();
    });
  }

  ngOnChanges(cambios) {

  }

  cargarComponent() {
    let filtros: QueryFilter[] = [
      { filtro: "operaciones", parametro: "true" }
    ]
    this.tipoActivoService.cargarPaginaFiltros(filtros)
      .subscribe(() => { },
        (error) => {
          console.log(error);
          this.sweetService.sweet_alerta("Error", "No fue posible cargar la lista Tipo de Activos", "error");
          this.location.back();
        });
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      id: [""],
      codigo: [""],
      descripcion: [""],
      fechaCompra: [""],
      valorCompra: [""],
      valorLibro: [""],
      valorRescate: [""],
      fechaBaja: [""],
      depreciacionAcumulada: [""],
      idDocumentoCompra: [""],
      idTipoActivo: [""],
      tituloPropiedad: [""],
      polizaImportacion: ["", [Validators.required]],
      fechaCreacion: [""],
    });
    this.cargando = false;
  }

  enviarObjeto() {
    if (this.form.valid) {
      this.activoGeneral.emit(this.form.value);
    } else {
      this.activoGeneral.emit(null);
      this.form.markAllAsTouched();
    }
  }

  getTiposActivos() {
    return this.tipoActivoService.getDatos();
  }

}