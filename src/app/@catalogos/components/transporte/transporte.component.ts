import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Proveedor } from '../../data/models/proveedor';
import { CorporacionService } from '../../data/services/corporacion.service';
import { ProveedorService } from '../../data/services/proveedor.service';
import { TransporteService } from '../../data/services/transporte.service';

@Component({
  selector: 'app-transporte',
  templateUrl: './transporte.component.html',
  styleUrls: ['./transporte.component.css']
})
export class TransporteComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  corporacion: boolean = false;
  header: ItemHeaderComponent = {
    titulo: 'Registro de Transporte',
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
    idProveedores: "*Campo Requerido",
    propio: "*Campo Requerido",
  };

  constructor(private serviceComponent: TransporteService, private sweetService: SweetService, private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder, private proveedorService: ProveedorService, private corporacionService: CorporacionService) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(first(value => value === false))
      .subscribe(() => {
        this.proveedorService.getCargando().pipe(first(value => value === false))
          .subscribe(() => this.validarPermiso());
      });
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
      codigo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      idProveedor: ["", [Validators.required]],
      propio: ["", [Validators.required]],
      proveedores: [""],
      entidadComercial: [""]
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
      first()
    ).subscribe(res => {
      console.log(res);

      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    });
  }

  guardarRegistro() {
    if (this.corporacion) {
      this.form.controls['propio'].enable();
    }
    if (this.form.valid) {
      this.serviceComponent.crear(this.form.value).pipe(
        first()
      ).subscribe(() => {
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
      if (this.corporacion) {
        this.form.controls['propio'].disable();
      }
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
      this.bloquearInputs();
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
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

  getProveedor(item: Proveedor) {
    if (item) {
      this.sweetService.sweet_carga("Espere");
      this.form.controls['idProveedor'].setValue(item.id);
      // IdCorporacion pasa a la endiad comercial => item.entidadComercial.idCorporacion
      if (item.entidadComercial.idCorporacion) {
        this.corporacion = true;
        this.corporacionService.getId(item.entidadComercial.idCorporacion).pipe(first())
          .subscribe(res => {
            this.form.controls['propio'].setValue(res.propio);
            this.form.controls['propio'].disable();
            this.sweetService.sweet_notificacion("Listo", 3000);
          });
      } else {
        this.corporacion = false;
        this.form.controls['propio'].enable();
        this.form.controls['propio'].setValue(null);
        this.sweetService.sweet_notificacion("Listo", 3000);
      }
    }
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['fechaCreacion'].disable();
    if (this.corporacion) {
      this.form.controls['propio'].disable();
    }
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['fechaCreacion'].enable();
    if (this.corporacion) {
      this.form.controls['propio'].enable();
    }
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
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
