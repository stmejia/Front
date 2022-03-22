import { Component, OnInit } from "@angular/core";
import { SweetService } from "./../../../@page/services/sweet.service";
import { SucursalService } from "./../../data/services/sucursal.service";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Empresa } from "../../data/models/empresa";
import { OpcionesHeaderComponent } from "src/app/@page/models/headers";
import { BaseComponent } from "src/app/@page/models/baseComponent";

@Component({
  selector: "app-sucursal",
  templateUrl: "./sucursal.component.html",
  styleUrls: ["./sucursal.component.css"],
})
export class SucursalComponent extends BaseComponent implements OnInit {

  listaDeEmpresas: Empresa[] = [];

  constructor(protected formBuilder: FormBuilder, protected s: SucursalService, protected sw: SweetService,
    protected ar: ActivatedRoute) {
    super("Sucursal", s, sw, ar);
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
      empresaId: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      direccion: ["", [Validators.required]],
      activa: ["", [Validators.required]],
      fchCreacion: [new Date()],
    });

    this.s.getListaEmpresas().subscribe(res => {
      this.listaDeEmpresas = res;
      this.cargarDatos();
    }, (error) => {
      this.sweetService.sweet_confirmacion("Error", "No es posible cargar la lista de empresas, intentelo mas tarde. ¿Desea volver a la pagina anterior?", "error")
        .then(confirmacion => {
          if (confirmacion.isConfirmed) {
            this.service.paginaAnterior();
          }
        });
    });
  }

  cargarDatos() {
    this.cargandoDatosDelComponente = true;

    if (this.validarParametro("id")) {
      this.form.addControl("id", new FormControl());
      this.s.consultar<Empresa>(this.activatedRoute.snapshot.paramMap.get("id"))
        .subscribe(res => {
          /* Fix EndPoint */
          if (res) {
            this.form.patchValue(res);
            this.bloquearInputs();
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
          this.service.paginaAnterior();
        })
    } else {
      this.cargandoDatosDelComponente = false;
    }
  }

  guardarRegistro() {
    this.habilitarInputs();
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
    this.habilitarInputs();
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

  bloquearInputs() {
    this.form.controls["empresaId"].disable();
  }

  habilitarInputs() {
    this.form.controls["empresaId"].enable();
  }
}
