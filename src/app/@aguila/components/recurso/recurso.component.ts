import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { RecursoService } from '../../data/services/recurso.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ActivatedRoute } from '@angular/router';
import { Recurso } from "../../data/models/recurso";
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-recurso',
  templateUrl: './recurso.component.html',
  styleUrls: ['./recurso.component.css']
})
export class RecursoComponent extends BaseComponent implements OnInit {

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  opciones: string[] = ["Consultar", "Agregar", "Modificar", "Eliminar", "Imprimir"];
  tiposDeRecursos: string[] = ["Catálogo", "Operación", "Reporte", "Configuración"];

  constructor(public s: RecursoService, protected formBuilder: FormBuilder,
    protected sw: SweetService, protected ar: ActivatedRoute) {
    super("Recurso", s, sw, ar);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.s.paginaAnterior();
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
    this.cargandoDatosDelComponente = true;
    this.header.opciones.push({ icono: "clear", nombre: "Regresar", disponible: true, idEvento: 1, toolTip: "Volver a la página anterior", color: 'warn' });
    if (this.validarParametro("id")) {
      this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'), idEvento: 3, toolTip: 'Guardar Registro', color: 'primary' })
    } else {
      this.header.opciones.push({ icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'), idEvento: 2, toolTip: 'Guardar Registro', color: 'primary' })
    }
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ["", [Validators.required]],
      tipo: ["", [Validators.required]],
      activo: ["", [Validators.required]],
      controlador: ["", [Validators.required]],
      opciones: [this.opciones, [Validators.required]],
    });

    this.cargarDatos();
  }

  cargarDatos() {
    this.cargandoDatosDelComponente = true;
    if (this.validarParametro("id")) {
      this.form.addControl("id", new FormControl());
      this.s.consultar<Recurso>(this.activatedRoute.snapshot.paramMap.get("id"))
        .subscribe(res => {
          if (res) {
            this.form.patchValue(res);
            this.cargandoDatosDelComponente = false;
          } else {
            this.sweetService.sweet_alerta("Error", "Registro no existe.", "error");
            this.header.opciones[1].disponible = this.opcionDisponible("Agregar");
            this.header.opciones[1].nombre = "Guardar";
            this.header.opciones[1].idEvento = 2;
            this.form.removeControl("id");
            this.cargandoDatosDelComponente = false;
          }
        }, (error) => {
          console.log(error);
          if (error.status == 404) {
            this.sweetService.sweet_alerta("Error", "Registro no existe.", "error");
            this.header.opciones[1].disponible = this.opcionDisponible("Agregar");
            this.header.opciones[1].nombre = "Guardar";
            this.header.opciones[1].idEvento = 2;
            this.cargandoDatosDelComponente = false;
            return;
          }
          this.sweetService.sweet_Error(error);
          this.s.paginaAnterior();
        });
    } else {
      this.cargandoDatosDelComponente = false;
    }
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.s.crear(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.form.reset();
        this.opciones = ["Consultar", "Agregar", "Modificar", "Eliminar", "Imprimir"];
        this.form.controls['opciones'].setValue(this.opciones);
      }, (error) => {
        if (error.status == 400) {
          this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
          this.errores(error.error.aguilaErrores[0].validacionErrores);
          return;
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
    }
  }

  modificarRegistro() {
    if (this.form.valid) {
      this.s.modificar(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.cargarDatos();
      }, (error) => {
        if (error.status == 400) {
          this.sweetService.sweet_alerta("Error", "Algunos datos son incorrectos", "error");
          this.errores(error.error.aguilaErrores[0].validacionErrores);
          return;
        }
        this.sweetService.sweet_Error(error);
      });
    } else {
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", "error");
      this.form.markAllAsTouched();
    }
  }

  removeOption(opcion: string): void {
    this.opciones = this.opciones.filter(opt => opt != opcion);
    this.form.controls['opciones'].setValue(this.opciones);
  }

  addOption(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.opciones.push(value);
      this.form.controls['opciones'].setValue(this.opciones);
    }
    event.input.value = "";
  }
}
