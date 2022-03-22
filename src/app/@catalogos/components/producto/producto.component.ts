import { ViewChild } from '@angular/core';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ToolsService } from 'src/app/@aguila/data/services/tools.service';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Lista } from '../../data/models/lista';
import { ProductoBodega } from '../../data/models/productoBodega';
import { TipoLista } from '../../data/models/tipoLista';
import { InventarioCategoriaService } from '../../data/services/inventario-categoria.service';
import { InventarioSubcategoriaService } from '../../data/services/inventario-subcategoria.service';
import { ListaService } from '../../data/services/lista.service';
import { MedidaService } from '../../data/services/medida.service';
import { ProductoBodegaService } from '../../data/services/producto-bodega.service';
import { ProductoService } from '../../data/services/producto.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {

  cargandoDatos: boolean = true;
  form: FormGroup;
  idEmpresa: number;

  header: ItemHeaderComponent = {
    titulo: 'Producto',
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
    bienServicio: "*Campo Requerido",
    idsubCategoria: "*Campo Requerido",
    idMedida: "*Campo Requerido"
  };

  colCategorias: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Descripción", aligment: "left", targetId: "descripcion", texto: true }
  ]

  colSubCategorias: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Descripción", aligment: "left", targetId: "descripcion", texto: true }
  ]

  colMedida: Columna[] = [
    { nombre: "Código", aligment: "left", targetId: "codigo", texto: true },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", texto: true }
  ]

  TL_TipoProducto: TipoLista;
  listaTipoProducto: Lista[];
  productosUbicacionBodega: ProductoBodega[] = [];

  public columnasProductoBodega: Columna[] = [
    { nombre: 'Bodega', targetOpt: ["estacionTrabajo", "nombre"], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Sucursal', targetOpt: ["estacionTrabajo", "sucursal", "nombre"], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Pasillo', targetId: 'pasillo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Estante', targetId: 'estante', tipo: 'texto', aligment: 'center' },
    { nombre: 'Nivel', targetId: 'nivel', tipo: 'texto', aligment: 'center' },
    { nombre: 'Lugar', targetId: 'lugar', tipo: 'texto', aligment: 'center' },
    { nombre: 'Maximo', targetId: 'maximo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Minimo', targetId: 'minimo', tipo: 'texto', aligment: 'center' },
  ];

  constructor(private serviceComponent: ProductoService, private sweetService: SweetService,
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private categoriaService: InventarioCategoriaService, private productoBodegaService: ProductoBodegaService,
    private subCategoriaService: InventarioSubcategoriaService, private medidaService: MedidaService,
    private tipoListaService: TipoListaService, private listaService: ListaService, public toolService: ToolsService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando(),
      this.categoriaService.getCargando(),
      this.subCategoriaService.getCargando(),
      this.medidaService.getCargando(),
      this.productoBodegaService.getCargando(),
      this.tipoListaService.getCargando().pipe(first(val => val == false)),
      this.listaService.getCargando().pipe(first(val => val == false)),
    ]).subscribe(() => this.validarPermiso(), (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar los servicios", 'error');
      this.serviceComponent.paginaAnterior();
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
      this.cargarTipoLista();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "No es posible acceder a la empresa", 'error');
      this.serviceComponent.paginaAnterior();
    });
  }

  cargarTipoLista() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "bienServicio").pipe(first()),
    ]).subscribe(res => {
      this.TL_TipoProducto = res[0][0];
      this.cargarListas();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar Tipos de Lista");
    });
  }

  cargarListas() {
    forkJoin([
      this.listaService.cargarPagina(this.TL_TipoProducto.id, this.idEmpresa).pipe(first()),
    ]).subscribe(res => {
      this.listaTipoProducto = res[0];
      this.medidaService.cargarPagina(1, this.idEmpresa);
      this.categoriaService.cargarPagina(1, this.idEmpresa);
      this.configurarFormulario();
    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar Listas");
      this.serviceComponent.paginaAnterior();
    });

  }

  cargarSubCategoria(idCategoria: number) {
    let filtros: QueryFilter[] = [];
    filtros.push({ filtro: "PageSize", parametro: "1" });
    filtros.push({ filtro: "idInvCategoria", parametro: idCategoria });
    this.form.controls['idsubCategoria'].setValue("");
    this.subCategoriaService.cargarPaginaFiltros(filtros);

  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      idEmpresa: [""],
      codigo: [""],
      codigoQR: ["QR"],
      descripcion: [""],
      bienServicio: [""],
      idCategoria: ["", [Validators.required]],
      idsubCategoria: [""],
      idMedida: [""],
      fechaBaja: [""],
      fechaCreacion: [new Date()]
    });
    if (!this.isNuevo()) {
      this.form.addControl("id", new FormControl("", [Validators.required]));
      this.form.addControl("fechaCreacion", new FormControl());
      this.form.addControl("descCategoria", new FormControl());
      this.form.addControl("descSubCategoria", new FormControl());
      this.form.addControl("nombreMedida", new FormControl());
      this.cargarRegistro(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
    } else {
      this.cargandoDatos = false;
    }
  }

  cargarRegistro(id: number) {
    this.serviceComponent.getId(id).subscribe(res => {
      this.form.setValue(res);
      this.bloquearInputs();

      let filtros: QueryFilter[] = [];
      filtros.push({ filtro: "PageSize", parametro: "1" });
      filtros.push({ filtro: "idInvCategoria", parametro: res.idCategoria });
      this.subCategoriaService.cargarPaginaFiltros(filtros);

      let filtrosProductoBodega: QueryFilter[] = [];
      filtrosProductoBodega.push({ filtro: "idProducto", parametro: res.id });

      this.productoBodegaService.getXFiltros(filtrosProductoBodega).subscribe(res => {
        this.productosUbicacionBodega = res;
        console.log(res);

      });

      this.cargandoDatos = false;

    }, (error) => {
      this.sweetService.sweet_alerta("Error", "Error al cargar el registro", "error");
      this.serviceComponent.paginaAnterior();
    });
  }

  guardarRegistro() {
    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      this.form.controls['idEmpresa'].setValue(res.estacionTrabajo.sucursal.empresaId);
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
    }, (error) => {
      this.sweetService.sweet_alerta('No es posible obtener la información de la empresa',
        'Vuelva a cargar la aplicación oh contacte con el administrador del sistema', 'error');
    });
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
    return this.categoriaService.getDatos();
  }

  getSubCategorias() {
    return this.subCategoriaService.getDatos();
  }

  getMedidas() {
    return this.medidaService.getDatos();
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
