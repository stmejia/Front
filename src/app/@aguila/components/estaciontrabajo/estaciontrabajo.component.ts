import { Component, OnInit } from '@angular/core';
import { EstaciontrabajoService } from '../../data/services/estaciontrabajo.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Estaciontrabajo } from '../../data/models/estaciontrabajo';
import { Sucursal } from '../../data/models/sucursal';

@Component({
  selector: 'app-estaciontrabajo',
  templateUrl: './estaciontrabajo.component.html',
  styleUrls: ['./estaciontrabajo.component.css']
})
export class EstaciontrabajoComponent extends BaseComponent implements OnInit {

  listaDeSucursales: Sucursal[] = [];

  constructor(protected formBuilder: FormBuilder, protected s: EstaciontrabajoService, protected sw: SweetService,
    protected ar: ActivatedRoute) {
    super("Estación De Trabajo", s, sw, ar);
  }

  ngOnInit(): void {
    this.iniciarComponent();
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.service.paginaAnterior();
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
      sucursalId: ["", [Validators.required]],
      tipo: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      activa: ["", [Validators.required]],
      fchCreacion: [new Date()],
    });

    forkJoin([
      this.s.getListaSucursales()
    ]).pipe(first()).subscribe(res => {
      this.listaDeSucursales = res[0];
      this.cargarDatos();
    }, (error) => {
      console.log(error);
      this.sw.sweet_Error(error);
    });
  }

  cargarDatos() {
    this.cargandoDatosDelComponente = true;
    if (this.validarParametro("id")) {
      this.form.addControl("id", new FormControl());
      this.s.consultar<Estaciontrabajo>(this.activatedRoute.snapshot.paramMap.get("id"))
        .subscribe(res => {
          this.form.patchValue(res);
          this.cargandoDatosDelComponente = false;
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
          this.service.paginaAnterior();
        })
    } else {
      this.cargandoDatosDelComponente = false;
    }
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.service.crear(this.form.value).subscribe(res => {
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.form.reset();
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
      this.service.modificar(this.form.value).subscribe(res => {
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
}
