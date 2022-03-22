import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { InventarioCategoriaService } from '../../data/services/inventario-categoria.service';
import { InventarioSubcategoriaService } from '../../data/services/inventario-subcategoria.service';

@Component({
  selector: 'app-inventario-subcategoria',
  templateUrl: './inventario-subcategoria.component.html',
  styleUrls: ['./inventario-subcategoria.component.css']
})
export class InventarioSubcategoriaComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  idEmpresa: number;

  header: ItemHeaderComponent = {
    titulo: 'Registro de Categoria Inventario',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    codigo: "*Campo Requerido",
    descripcion: "*Campo Requerido",
    idInvCategoria: "*Campo Requerido"
  };

  colTipoEquipoRemolque: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", tipo: 'texto' },
    { nombre: "Descripcion", aligment: "left", targetId: "descripcion", tipo: 'texto' }
  ];

  constructor(private serviceComponent: InventarioSubcategoriaService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private serviceInvCategoria: InventarioCategoriaService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando(),
      this.serviceInvCategoria.getCargando(),
    ]).subscribe(() => this.validarPermiso());
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
      this.serviceComponent.errorPermiso("Agregar - Modificar - Consultar");
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

    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      this.idEmpresa = res.estacionTrabajo.sucursal.empresaId;
      this.serviceInvCategoria.cargarPagina(1, this.idEmpresa);
      this.configurarFormulario();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar la empresa", 'error');
      this.serviceComponent.paginaAnterior();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idInvCategoria: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      descripcion: ["", [Validators.required]],
      empresa: [""]
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
    this.serviceComponent.getId(id).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();
      this.cargandoDatos = false;
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar el registro", "error");
      this.serviceComponent.paginaAnterior();
    });
  }

  guardarRegistro() {
    if (this.form.valid) {
      this.serviceComponent.crear(this.form.value).subscribe(() => {
        this.sweetService.sweet_alerta(
          "Completado",
          "Registro guardado"
        );
        this.serviceComponent.paginaAnterior();
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
      this.serviceComponent.modificar(this.form.value).subscribe(res => {
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
      this.form.markAllAsTouched();
      this.sweetService.sweet_alerta('Error', 'Complete los campos requeridos.', 'error');
    }
  }

  getCategorias() {
    return this.serviceInvCategoria.getDatos();
  }

  bloquearInputs() {
    this.form.controls['fechaCreacion'].disable();
  }

  habilitarInputs() {
    this.form.controls['fechaCreacion'].enable();
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
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
