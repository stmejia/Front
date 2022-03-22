import { TipoReparacionesService } from './../../data/services/tipo-reparaciones.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-tipo-reparaciones',
  templateUrl: './tipo-reparaciones.component.html',
  styleUrls: ['./tipo-reparaciones.component.css']
})
export class TipoReparacionesComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Tipo de Reparación',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }
  codErrores = {
    codigo: "*Campo Requerido",
    nombre: "*Campo Requerido",
    descripcion: "*Campo Requerido"
  };

  constructor(private serviceComponent: TipoReparacionesService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.validarPermiso();
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

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar') ||
      this.serviceComponent.validarPermiso('Agregar') ||
      this.serviceComponent.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso();
      this.serviceComponent.paginaAnterior();
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
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      descripcion: ["", [Validators.required]],
      idEmpresa: ["", [Validators.required]],
    });
    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl("", [Validators.required]));
      this.form.addControl("fechaCreacion", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).pipe(
      first()
    ).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    })
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['fechaCreacion'].disable();
    this.form.controls['codigo'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['fechaCreacion'].enable();
    this.form.controls['codigo'].enable();
  }

  guardarRegistro() {
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      if (res) {
        this.form.controls['idEmpresa'].setValue(res.estacionTrabajo.sucursal.empresaId);
        if (this.form.valid) {
          this.serviceComponent.crear(this.form.value).pipe(
            first()
          ).subscribe(() => {
            this.sweetService.sweet_alerta(
              "Completado",
              "Registro guardado exitosamene"
            );
          }, (error) => {
            if (error.status == 400) {
              this.errores(error.error.aguilaErrores[0].validacionErrores);
            }
          });
        } else {
          this.form.markAllAsTouched();
          this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
        }
      } else {
        this.sweetService.sweet_alerta("Error", "No es posible asignar la Empresa a este registro. Contacte al administrador del sistemas", 'error');
      }
    })
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

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

  errores(validaciones: []) {
    //Recorremos por medio del form los errores que contiene
    for (const validacion in validaciones) {
      //Esta variable contiene el mensaje de error proveniente del api
      var error = validaciones[validacion];
      //Recorremos nuestro array que contiene los codigos de los errores
      for (const codError in this.codErrores) {
        //verificamos si un error esta contenido en nuestro array
        if (validacion.toLowerCase().trim() === codError.toLowerCase().trim()) {
          //Si la condicion se cumple seteamos el mensaje de error a nuestro array  y lo mostramos en el input
          this.codErrores[codError] = error;
          this.form.get(codError).setErrors(["api"]);
          this.form.markAllAsTouched();
        }
      }
    }
  }

}
