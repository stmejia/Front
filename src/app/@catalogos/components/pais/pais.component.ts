import { ItemHeaderComponent } from './../../../@page/models/headers';
import { PaisService } from './../../data/services/pais.service';
import { Component, OnInit } from '@angular/core';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";

@Component({
  selector: 'app-pais',
  templateUrl: './pais.component.html',
  styleUrls: ['./pais.component.css']
})
export class PaisComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Paises',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }
  codErrores = {
    nombre: "*Campo Requerido",
    codMoneda: "*Campo Requerido",
    codAlfa2: "*Campo Requerido",
    codAlfa3: "*Campo Requerido",
    codNumerico: "*Campo Requerido",
    idioma: "*Campo Requerido"
  };

  constructor(private sweetService: SweetService, private paisService: PaisService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.paisService.getCargando().pipe(
      first(value => value === false)
    ).subscribe(res => {
      this.validarPermiso();
    });
  }

  //Controla los eventos que emite el Header del Componente
  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      // El evento 1 es Regresar
      case 1:
        this.paisService.paginaAnterior();
        break;
      // El evento 2 Guarda Registro Nuevo
      case 2:
        this.guardarRegistro();
        break;
      case 3:
        this.modificarRegistro();
        break;
    }
  }

  validarPermiso() {
    if (this.paisService.validarPermiso('Consultar') || this.paisService.validarPermiso('Agregar') || this.paisService.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.paisService.errorPermiso();
      this.paisService.paginaAnterior();
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

    this.paisService.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ["", [Validators.required]],
      codMoneda: ["", [Validators.required]],
      codAlfa2: ["", [Validators.required, Validators.maxLength(2)]],
      codAlfa3: ["", [Validators.required, Validators.maxLength(3)]],
      codNumerico: ["", [Validators.required]],
      idioma: ["", [Validators.required]],
    });
    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl("", [Validators.required]));
      this.form.addControl("fechaCreacion", new FormControl());
      //this.form.addControl("departamentos", new FormControl());
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
    this.paisService.getId(id).pipe(
      first()
    ).subscribe(res => {
      console.log(res);
      
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    })
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.paisService.crear(this.form.value).pipe(
        first()
      ).subscribe(() => {
        this.sweetService.sweet_alerta(
          "Registro Completo",
          "Pais registrado correctamente"
        );
        this.paisService.paginaAnterior();
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
      this.paisService.modificar(this.form.value).pipe(
        first()
      ).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.bloquearInputs();
        this.paisService.paginaAnterior();
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
    return this.paisService.validarPermiso(opcion);
  }

  get configuracionComponent() {
    return this.paisService.getConfiguracionComponent();
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
