import { PaisService } from './../../data/services/pais.service';
import { DepartamentoService } from './../../data/services/departamento.service';
import { Component, OnInit } from '@angular/core';
import { Columna } from 'src/app/@page/models/columna';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html',
  styleUrls: ['./departamento.component.css']
})
export class DepartamentoComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Departamento',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    codigo: "*Campo Requerido",
    idPais: "*Campo Requerido",
    nombre: "*Campo Requerido",
  };

  colPaises: Columna[] = [
    { nombre: "Cód de Moneda", aligment: "center", targetId: "codMoneda", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  constructor(private departamentoService: DepartamentoService, private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder, private sweetService: SweetService, private paisService: PaisService) { }

  ngOnInit(): void {
    forkJoin([
      this.departamentoService.getCargando().pipe(first(v => v === false)),
      this.paisService.getCargando().pipe(first(v => v === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventoSelectRecurso(evento) {
    this.form.controls['idRecurso'].setValue(evento);
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      // El evento 1 es Regresar
      case 1:
        this.departamentoService.paginaAnterior();
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

  getPaises() {
    return this.paisService.getPaises();
  }

  validarPermiso() {
    if (this.departamentoService.validarPermiso('Consultar') ||
      this.departamentoService.validarPermiso('Agregar') ||
      this.departamentoService.validarPermiso('Modificar')) {
      this.cargarComponent();
    } else {
      this.departamentoService.errorPermiso();
      this.departamentoService.paginaAnterior();
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

    this.departamentoService.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });
    this.configurarFormulario();
    this.paisService.cargarPagina().pipe(first()).subscribe();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idPais: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
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
    this.departamentoService.getId(id).pipe(
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
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.departamentoService.crear(this.form.value).pipe(
        first()
      ).subscribe(() => {
        this.sweetService.sweet_alerta(
          "Registro Completo",
          "Pais registrado correctamente"
        );
        this.departamentoService.paginaAnterior();
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
      this.departamentoService.modificar(this.form.value).pipe(
        first()
      ).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.bloquearInputs();
        this.departamentoService.paginaAnterior();
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
    return this.departamentoService.validarPermiso(opcion);
  }

  get configuracionComponent() {
    return this.departamentoService.getConfiguracionComponent();
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
