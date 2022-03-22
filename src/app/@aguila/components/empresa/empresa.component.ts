import { Empresa } from "./../../data/models/empresa";
import { SweetService } from "./../../../@page/services/sweet.service";
import { EmpresaService } from "./../../data/services/empresa.service";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { ImagenRecursoConfiguracion } from "../../data/models/imagenRecursoConfiguracion";
import { BaseComponent } from "src/app/@page/models/baseComponent";

@Component({
  selector: "app-empresa",
  templateUrl: "./empresa.component.html",
  styleUrls: ["./empresa.component.css"],
})

export class EmpresaComponent extends BaseComponent implements OnInit {

  imgRecursoLogo: ImagenRecursoConfiguracion = null;

  constructor(protected s: EmpresaService, protected sw: SweetService,
    protected ar: ActivatedRoute, protected formBuilder: FormBuilder) {
    super("Empresa", s, sw, ar);
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
    this.s.getImagenRecursoConfiguracion("ImagenPerfil").subscribe(res => {
      this.imgRecursoLogo = res;
      this.configurarFormulario();
    }, (error) => {
      console.log(error);
      this.sw.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.configurarFormulario();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      abreviatura: ["", [Validators.required]],
      aleas: ["", [Validators.required]],
      activ: ["", [Validators.required]],
      fchCreacion: [new Date()],
      esEmpleador: [false, [Validators.required]],
      nit: ["", [Validators.required]],
      direccion: ["", [Validators.required]],
      telefono: [""],
      email: [""],
      webPage: [""],
      pais: ["", [Validators.required]],
      departamento: ["", [Validators.required]],
      municipio: ["", [Validators.required]],
      imagenLogo: [""],
    });

    this.cargarDatos();
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
}