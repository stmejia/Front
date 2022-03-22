import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaseComponent } from 'src/app/@page/models/baseComponent';
import { OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Generador } from '../../data/models/generador';
import { Lista } from '../../data/models/lista';
import { TipoGenerador } from '../../data/models/tipoGenerador';
import { GeneradorService } from '../../data/services/generador.service';

@Component({
  selector: 'app-generador',
  templateUrl: './generador.component.html',
  styleUrls: ['./generador.component.css']
})
export class GeneradorComponent extends BaseComponent implements OnInit {

  listaCocTipoInstalacion: Lista[] = [];
  listaCocMarcaGenerador: Lista[] = [];
  listaTipoGenerador: TipoGenerador[] = [];

  constructor(protected s: GeneradorService, protected sweetService: SweetService, protected formBuilder: FormBuilder,
    protected activatedRoute: ActivatedRoute) { 
      super("Generador", s, sweetService, activatedRoute);
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

    this.cargarListas();
  }

  cargarListas(){
    forkJoin([
      this.s.getListas("tipoInstalacion"),
      this.s.getListas("marcaGenerador"),
      this.s.getTiposGenerador()
    ]).subscribe(res => {
      this.listaCocTipoInstalacion = res[0];
      this.listaCocMarcaGenerador = res[1];
      this.listaTipoGenerador = res[2];
      this.configurarFormulario();
    })
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      activoOperacion: ["", [Validators.required]],
      idTipoGenerador: ["", [Validators.required]],
      capacidadGalones: [""],
      tipoEnfriamiento: [""],
      numeroCilindros: [""], //---------- ----------
      marcaGenerador: [""],
      tipoInstalacion: [""],

      aptoParaCA: [""], //COC

      codigoAnterior: [""],
      tipoMotor: [""],
      velocidad: [""],
      potenciaMotor: [""],
      modeloGenerador: [""],
      serieGenerador: [""],
      potenciaGenerador: [""],
      tensionGenerador: [""],
      tipoAceite: [""],
      tipoGeneradorGen: [""],

      noMotor: [""],
      tipoTanque: [""],

      idEstacion: [this.s.getEstacionTrabajo().id]
    });

    this.cargarDatos();
  }

  cargarDatos() {
    this.cargandoDatosDelComponente = true;
    if (this.validarParametro("id")) {
      this.form.addControl("id", new FormControl());
      this.s.consultar<Generador>(this.activatedRoute.snapshot.paramMap.get("id"))
        .subscribe(res => {
          /* Fix EndPoint */
          if (res) {
            this.form.patchValue(res);
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
        this.form.reset();
        this.sweetService.sweet_notificacion("Registro Guardado", 5000, 'success');
        this.form.controls["idEstacion"].setValue(this.s.getEstacionTrabajo().id);
        console.log(this.form.value);
      }, (error) => {
        console.log(error);
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
