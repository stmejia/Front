import { MunicipioService } from './../../data/services/municipio.service';
import { DepartamentoService } from './../../data/services/departamento.service';
import { PaisService } from './../../data/services/pais.service';
import { UbicacionService } from './../../data/services/ubicacion.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { first } from 'rxjs/operators';
import { Columna } from 'src/app/@page/models/columna';
import { Observable } from 'rxjs';
import { Pais } from '../../data/models/pais';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.css']
})
export class UbicacionComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  header: ItemHeaderComponent = {
    titulo: 'Ubicación',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    idMunicipio: "*Campo Requerido",
    esPuerto: "*Campo Requerido",
    lugar: "*Campo Requerido",
    codigoPostal: "*Campo Requerido",
    codigo: "*Campo Requerido"
  };

  colPaises: Columna[] = [
    { nombre: "Cód de Moneda", aligment: "center", targetId: "codMoneda", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  colDepartamentos: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  colMunicipios: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codMunicipio", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombreMunicipio", texto: true }
  ]

  constructor(private serviceComponent: UbicacionService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private paisService: PaisService,
    private departamentosService: DepartamentoService, private municipioService: MunicipioService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.serviceComponent.getCargando().pipe(
      first(value => value === false)
    ).subscribe(() => {
      this.paisService.getCargando()
        .pipe(first(value => value === false))
        .subscribe(() => {
          this.departamentosService.getCargando().pipe(first(value => value === false))
            .subscribe(() => {
              this.municipioService.getCargando().pipe(first(value => value === false))
                .subscribe(() => this.validarPermiso());
            });
        });
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
    this.paisService.cargarPagina().pipe(first()).subscribe();
    this.configurarFormulario();
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idPais: ["", [Validators.required]],
      latitud: [0],
      longitud: [0],
      idDepartamento: ["", [Validators.required]],
      idMunicipio: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      esPuerto: ["", [Validators.required]],
      lugar: ["", Validators.required],
      idEmpresa: ["", Validators.required],
      codigoPostal: ["", [Validators.required]],
      vDireccion: [""],
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
    ).subscribe(async res => {
      console.log(res);
      await this.selectPais(res.idPais);
      await this.selectDepartamento(res.idDepartamento);
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    });
  }

  bloquearInputs() {
    this.form.controls['id'].disable();
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['id'].enable();
    this.form.controls['fechaCreacion'].enable();
  }

  async selectPais(idPais) {
    this.form.controls['idPais'].setValue(idPais);
    this.form.controls['idDepartamento'].setValue(null);
    this.form.controls['idMunicipio'].setValue(null);
    this.departamentosService.cargarPaginaPais(idPais).pipe(first()).subscribe();
    return true;
  }

  async selectDepartamento(idDepartamento) {
    this.form.controls['idDepartamento'].setValue(idDepartamento);
    this.form.controls['idMunicipio'].setValue(null);
    this.municipioService.cargarPaginaDepartamento(idDepartamento).pipe(first()).subscribe(res => console.log(res));
  }

  guardarRegistro() {
    this.serviceComponent.getEstacionTrabajo().pipe(first()).subscribe(res => {
      this.form.controls["idEmpresa"].setValue(res.estacionTrabajo.sucursal.empresaId);
      if (this.form.valid) {
        this.serviceComponent.crear(this.form.value).pipe(
          first()
        ).subscribe(() => {
          this.sweetService.sweet_alerta(
            "Completado",
            "Registro guardado exitosamene"
          );
          this.serviceComponent.cargarPagina(); //Eliminar
        }, (error) => {
          if (error.status == 400) {
            this.errores(error.error.aguilaErrores[0].validacionErrores);
          }
        });
      } else {
        this.form.markAllAsTouched();
        this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
      }
    });
  }

  modificarRegistro() {
    this.habilitarInputs();
    if (this.form.valid) {
      this.serviceComponent.modificar(this.form.value).pipe(
        first()
      ).subscribe(res => {
        this.sweetService.sweet_notificacion("Cambios Guardados", 5000);
        this.bloquearInputs();
        this.serviceComponent.cargarPagina(); //Eliminar
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

  getPaises(): Observable<Pais[]> {
    return this.paisService.getPaises();
  }

  getDepartamentos() {
    return this.departamentosService.getDepartamentos(false, this.form.controls['idPais'].value);
  }

  getMunicipios() {
    return this.municipioService.getMunicipios();
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
