import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { PilotoTipoService } from '../../data/services/piloto-tipo.service';
import { PilotoService } from '../../data/services/piloto.service';

@Component({
  selector: 'app-piloto',
  templateUrl: './piloto.component.html',
  styleUrls: ['./piloto.component.css']
})
export class PilotoComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Piloto',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    codigoPiloto: "*Campo Requerido",
    nombres: "*Campo Requerido",
    fechaIngreso: "*Campo Requerido"
  };

  colTipoPiloto: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", tipo: 'texto' },
    { nombre: "Descripción", aligment: "left", targetId: "descripcion", tipo: 'texto' }
  ];

  constructor(private serviceComponent: PilotoService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private tipoPilotoService: PilotoTipoService) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(first(value => value === false))
      .subscribe(() => {
        this.tipoPilotoService.getCargando().pipe(first(value => value === false))
          .subscribe(res => this.validarPermiso());
      });
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.serviceComponent.paginaAnterior();
        break;
      case 2:
        this.guardarRegistro();
        break;
      case 3:
        this.modificarRegistro();
        break;
    }
  }

  cargarComponent() {
    if (this.isNuevo()) {
      this.header.opciones.push({
        icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'),
        idEvento: 2, toolTip: 'Guardar Registro', color: 'primary'
      });
    } else {
      this.header.opciones.push({
        icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'),
        idEvento: 3, toolTip: 'Guardar Registro', color: 'primary'
      });
    }

    this.serviceComponent.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });

    this.configurarFormulario();
    this.tipoPilotoService.cargarPagina().pipe(first()).subscribe(res => console.log(res));
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      codigoPiloto: [""],
      idTipoPilotos: [""],
      idEmpleado: [""],
      fechaIngreso: [""],
      fechaBaja: [""]
    });

    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl("", [Validators.required]));
      this.form.addControl("fechaCreacion", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).pipe(
      first(),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        this.serviceComponent.paginaAnterior();
        return [];
      })
    ).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    });
  }

  getTiposPilotos() {
    return this.tipoPilotoService.getDatos();
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.serviceComponent.crear(this.form.value).pipe(
        first()
      ).subscribe((res) => {
        console.log(res);
        this.sweetService.sweet_alerta(
          "Completado",
          "Registro guardado exitosamene"
        );
        this.serviceComponent.paginaAnterior();
      }, (error) => {
        if (error.status == 400) {
          this.errores(error.error.aguilaErrores[0].validacionErrores);
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  modificarRegistro() {
    this.habilitarInputs();
    if (this.form.valid) {
      this.serviceComponent.modificar(this.form.value).pipe(
        first()
      ).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.bloquearInputs();
        this.serviceComponent.paginaAnterior();
      }, (error) => {
        this.bloquearInputs();
        if (error.status == 400) {
          this.errores(error.error.aguilaErrores[0].validacionErrores);
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['codigoPiloto'].disable();
    this.form.controls['fechaCreacion'].disable();
    this.form.controls['fechaBaja'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['codigoPiloto'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar') ||
      this.serviceComponent.validarPermiso('Agregar') ||
      this.serviceComponent.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar, Modificar, Agregar");
      this.serviceComponent.paginaAnterior();
    }
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

  errores(validaciones: []) {
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
