import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ActivoOperacionService } from 'src/app/@catalogos/data/services/activo-operacion.service';
import { EscanerQRComponent } from 'src/app/@page/components/escaner-qr/escaner-qr.component';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ControlEquipoService } from '../../data/services/control-equipo.service';

@Component({
  selector: 'app-ieequipo',
  templateUrl: './ieequipo.component.html',
  styleUrls: ['./ieequipo.component.css']
})
export class IEEquipoComponent implements OnInit {

  cargando: boolean = true;
  buscarPor: string = "Código";
  inputValue: string = "";
  form: FormGroup;
  fecha = new Date();

  header: ItemHeaderComponent = {
    titulo: 'Ingreso / Salida De Equipo',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      },
      {
        icono: 'save_alt', nombre: 'Guardar', disponible: true,
        idEvento: 2, toolTip: 'Guardar Registro', color: 'primary'
      }
    ]
  }

  constructor(private activoService: ActivoOperacionService, private sweetService: SweetService, private formBuilder: FormBuilder,
    private controlEquipoService: ControlEquipoService) {
    forkJoin([
      this.activoService.getCargando().pipe(first(v => v == false)),
      this.controlEquipoService.getCargando().pipe(first(v => v == false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  ngOnInit(): void {
  }

  eventosHeader(evento: OpcionesHeaderComponent) {
    switch (evento.idEvento) {
      case 1:
        this.activoService.paginaAnterior();
        break;
      case 2:
        if (this.form.controls['evento'].value == 'Egresado') {
          this.form.controls['cargado'].setValue(false);
        }
        if (this.form.valid) {
          this.form.controls["idUsuario"].setValue(this.controlEquipoService.getUsuario().id);
          this.form.controls["idEstacionTrabajo"].setValue(this.activoService.getEstacionTrabajo().id);
          this.form.controls["idEmpresa"].setValue(this.activoService.getEmpresa().id);
          this.form.controls["lugar"].setValue(this.activoService.getEstacionTrabajo().codigo);
          this.form.controls["activoOperacion"].disable();
          this.form.controls["empleado"].disable();
          //this.form.controls["observaciones"].setValue(`
          //${this.form.controls["evento"].value} de predio por: ${this.form.controls["guardiaNombre"].value} - Observaciones: ${this.form.controls["observaciones"].value} `);
          this.controlEquipoService.setIngresoSalida(this.form.value).pipe(first()).subscribe(res => {
            this.form.controls["activoOperacion"].enable();
            this.form.controls["empleado"].enable();
            this.form.reset();
            //this.form.controls["guardiaNombre"].enable;
            this.inputValue = "";
            this.sweetService.sweet_alerta("Listo", "Movimiento Registrado", "success");
          }, (error) => {
            this.form.controls["activoOperacion"].enable();
            this.form.controls["empleado"].enable();
            this.sweetService.sweet_Error(error);
          });
        } else {
          this.sweetService.sweet_alerta("Error", "Complete los datos", "error");
          this.form.markAllAsTouched()
        }
        break;
    }
  }

  cargarComponent() {
    this.activoService.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idActivo: [""],
      idEmpresa: [""],
      idEstacionTrabajo: [""],
      idPiloto: [""],
      idUsuario: [""],
      evento: ["", Validators.required],
      cargado: ["", Validators.required],
      lugar: [""],
      observaciones: [""],
      activoOperacion: [""],
      empleado: [""]
    });

    this.cargando = false;
  }

  abrirEscanerQR() {
    this.activoService.abrirComponenteModal(EscanerQRComponent).subscribe(res => {
      let filtros = [];
      filtros.push(
        { filtro: "codigo", parametro: res }
      );
      this.inputValue = res;
      this.buscarPor = "Código";
    });
  }

  buscar() {
    this.activoService.getEquipoCodigo(this.inputValue).subscribe(res => {
      this.form.patchValue(res);
      this.form.controls['observaciones'].setValue('');
    });
  }

  validarPermiso() {
    if (this.activoService.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.activoService.errorPermiso("Consultar");
      this.activoService.paginaAnterior();
    }
  }

  get configuracionComponent() {
    return this.activoService.getConfiguracionComponent();
  }
}
