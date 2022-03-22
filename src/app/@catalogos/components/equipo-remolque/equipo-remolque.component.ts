import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
import { ImagenRecurso } from 'src/app/@aguila/data/models/imagenRecurso';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { Columna } from 'src/app/@page/models/columna';
import { ItemHeaderComponent, OpcionesHeaderComponent } from 'src/app/@page/models/headers';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Lista } from '../../data/models/lista';
import { TipoEquipoRemolque } from '../../data/models/tipoEquipoRemolque';
import { TipoLista } from '../../data/models/tipoLista';
import { ActivoOperacionService } from '../../data/services/activo-operacion.service';
import { EquipoRemolqueService } from '../../data/services/equipo-remolque.service';
import { ListaService } from '../../data/services/lista.service';
import { TipoEquipoRemolqueService } from '../../data/services/tipo-equipo-remolque.service';
import { TipoListaService } from '../../data/services/tipo-lista.service';

@Component({
  selector: 'app-equipo-remolque',
  templateUrl: './equipo-remolque.component.html',
  styleUrls: ['./equipo-remolque.component.css']
})

export class EquipoRemolqueComponent implements OnInit {

  cargando: boolean = true;
  form: FormGroup;
  erroresActivoOperacion: { [key: string]: any } = {};
  tipoEquipoRemolque: TipoEquipoRemolque;

  TL_NoEjes: TipoLista;
  TL_TandemCorredizo: TipoLista;
  TL_ChasisExtensible: TipoLista;
  TL_TipoCuello: TipoLista;
  TL_AcopleGenset: TipoLista;
  TL_AcopleDolly: TipoLista;
  TL_MedidaPlataforma: TipoLista;
  TL_PlataformaExtensible: TipoLista;
  TL_Pechera: TipoLista;
  TL_CapacidadCargaLB: TipoLista;
  TL_lbExtensible: TipoLista;
  TL_AlturaContenedor: TipoLista;
  TL_TipoContenedor: TipoLista;
  TL_MarcaUR: TipoLista;
  TL_EjeCorredizo: TipoLista;
  TL_LargoFurgon: TipoLista;
  TL_MedidasFurgon: TipoLista;

  listaNoEjes: Lista[] = [];
  listaTandemCorredizo: Lista[] = [];
  listaChasisExtensible: Lista[] = [];
  listaTipoCuello: Lista[] = [];
  listaAcopleGenset: Lista[] = [];
  listaAcopleDolly: Lista[] = [];
  listaMedidaPlataforma: Lista[] = [];
  listaPlataformaExtensible: Lista[] = [];
  listaPechera: Lista[] = [];
  listaCapacidadCargaLB: Lista[] = [];
  listaLbExtensible: Lista[] = [];
  listaAlturaContenedor: Lista[] = [];
  listaTipoContenedor: Lista[] = [];
  listaMarcaUR: Lista[] = [];
  listaEjeCorredizo: Lista[] = [];
  listaFurgonLargo: Lista[] = [];
  listaMedidasFurgon: Lista[] = [];
  listaSuspension: Lista[] = [];
  listaRieles: Lista[] = [];
  listaMedidaLB: Lista[] = [];

  header: ItemHeaderComponent = {
    titulo: 'Equipo de Remolque',
    opciones: [
      {
        icono: 'clear', nombre: 'Regresar', disponible: true,
        idEvento: 1, toolTip: 'Volver a la página anterior', color: 'warn'
      }
    ]
  }

  codErrores = {
    noEjes: "",
    tandemCorredizo: "",
    chasisExtensible: "",
    tipoCuello: "",
    acopleGenset: "",
    acopleDolly: "",
    capacidadCargaLB: "",
    medidaPlataforma: "",
    tarjetaCirculacion: "",
    placa: "",
    pechera: "",
    alturaContenedor: "",
    tipoContenedor: "",
    marcaUR: "",
    largoFurgon: "",
    rielesHorizontales: "",
    rielesVerticales: ""
  };

  colTipoEquipoRemolque: Columna[] = [
    { nombre: "Prefijo", aligment: "left", targetId: "prefijo", tipo: "texto" },
    { nombre: "Descripcion", aligment: "left", targetId: "descripcion", tipo: "texto" }
  ];

  imgRecursoFotos: ImagenRecursoConfiguracion = null;
  imgRecursoTarjetaCirculacion: ImagenRecursoConfiguracion = null;

  constructor(private serviceComponent: EquipoRemolqueService, private sweetService: SweetService, private formBuilder: FormBuilder,
    private tipoListaService: TipoListaService, private listaService: ListaService, private tipoEquipoRemolqueService: TipoEquipoRemolqueService,
    private activatedRoute: ActivatedRoute, private activoOperacionService: ActivoOperacionService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(val => val === false)),
      this.tipoEquipoRemolqueService.getCargando().pipe(first(val => val === false)),
      this.tipoListaService.getCargando().pipe(first(val => val === false)),
      this.listaService.getCargando().pipe(first(val => val === false)),
      this.activoOperacionService.getCargando().pipe(first(val => val === false)),
    ]).subscribe(res => {
      this.cargarComponent();
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

  cargarComponent() {
    if (this.isNuevo()) {
      this.header.opciones.push({
        //icono: 'save_alt', nombre: 'Guardar', disponible: this.opcionDisponible('Agregar'),
        icono: 'save_alt', nombre: 'Guardar', disponible: true,
        idEvento: 2, toolTip: 'Guardar Registro', color: 'primary'
      });
    } else {
      this.header.opciones.push({
        //icono: 'save_alt', nombre: 'Guardar Cambios', disponible: this.opcionDisponible('Modificar'),
        icono: 'save_alt', nombre: 'Guardar Cambios', disponible: true,
        idEvento: 3, toolTip: 'Guardar Registro', color: 'primary'
      });
    }

    this.serviceComponent.setConfiguracionComponent({
      header: this.header,
      isModal: false,
    });
    this.tipoEquipoRemolqueService.cargarPagina().pipe(first()).subscribe();
    this.imgRecursoFotos = this.activoOperacionService.getImagenRecurso("Fotos");
    this.serviceComponent.getImagenRecursoConfiguracion("ImagenTarjetaCirculacion").subscribe(res => {
      this.imgRecursoTarjetaCirculacion = res;
      this.configurarFormulario();
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_notificacion("La pantalla presenta errores", 5000, 'error');
      this.configurarFormulario();
    });
  }

  configurarFormulario() {
    this.form = this.formBuilder.group({
      activoOperacion: ["", [Validators.required]],
      idTipoEquipoRemolque: ["", [Validators.required]],
      placa: [""],
      tarjetaCirculacion: [""],
      noEjes: [""],//---------- ----------
      tandemCorredizo: [""],//
      chasisExtensible: [""],//
      tipoCuello: [""],//
      acopleGenset: [""],//
      acopleDolly: [""],//
      capacidadCargaLB: [""],//
      medidaPlataforma: [""],//
      pechera: [""],
      alturaContenedor: [""],
      tipoContenedor: [""],
      marcaUR: [""],
      largoFurgon: [""],
      imagenTarjetaCirculacion: [""],

      medidaLB: [""],
      suspension: [""],
      rieles: [""],
      idEstacion: [this.serviceComponent.getEstacion().id]
    });
    this.cargarTiposLista();
  }

  cargarTiposLista() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "noEjes").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tandemCorredizo").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "chasisExtensible").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoCuello").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "acopleGenset").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "acopleDolly").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "medidaPlataforma").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "plataformaExtensible").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "pechera").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "capacidadCargaLB").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "lbExtensible").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "alturaContenedor").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "tipoContenedor").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "marcaUR").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "ejeCorredizo").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "largoFurgon").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecurso().id, "medidasFurgon").pipe(first()),
    ]).subscribe(res => {
      this.TL_NoEjes = res[0][0];
      this.TL_TandemCorredizo = res[1][0];
      this.TL_ChasisExtensible = res[2][0];
      this.TL_TipoCuello = res[3][0];
      this.TL_AcopleGenset = res[4][0];
      this.TL_AcopleDolly = res[5][0];
      this.TL_MedidaPlataforma = res[6][0];
      this.TL_PlataformaExtensible = res[7][0];
      this.TL_Pechera = res[8][0];
      this.TL_CapacidadCargaLB = res[9][0];
      this.TL_lbExtensible = res[10][0];
      this.TL_AlturaContenedor = res[11][0];
      this.TL_TipoContenedor = res[12][0];
      this.TL_MarcaUR = res[13][0];
      this.TL_EjeCorredizo = res[14][0];
      this.TL_LargoFurgon = res[15][0];
      this.TL_MedidasFurgon = res[16][0];
      this.cargarListas();
    });
  }

  cargarListas() {
    this.serviceComponent.getEstacionTrabajo().subscribe(res => {
      forkJoin([
        this.listaService.cargarPagina(this.TL_NoEjes.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_TandemCorredizo.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_ChasisExtensible.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_TipoCuello.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_AcopleGenset.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_AcopleDolly.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_MedidaPlataforma.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_PlataformaExtensible.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_Pechera.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_CapacidadCargaLB.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_lbExtensible.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_AlturaContenedor.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_TipoContenedor.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_MarcaUR.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_EjeCorredizo.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_LargoFurgon.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.listaService.cargarPagina(this.TL_MedidasFurgon.id, res.estacionTrabajo.sucursal.empresaId).pipe(first()),
        this.serviceComponent.getListas("suspesion"),
        this.serviceComponent.getListas("rieles"),
        this.serviceComponent.getListas("medidaLB"),

      ]).pipe(first()).subscribe(res => {
        this.listaNoEjes = res[0];
        this.listaTandemCorredizo = res[1];
        this.listaChasisExtensible = res[2];
        this.listaTipoCuello = res[3];
        this.listaAcopleGenset = res[4];
        this.listaAcopleDolly = res[5];
        this.listaMedidaPlataforma = res[6];
        this.listaPlataformaExtensible = res[7];
        this.listaPechera = res[8];
        this.listaCapacidadCargaLB = res[9];
        this.listaLbExtensible = res[10];
        this.listaAlturaContenedor = res[11];
        this.listaTipoContenedor = res[12];
        this.listaMarcaUR = res[13];
        this.listaEjeCorredizo = res[14];
        this.listaFurgonLargo = res[15];
        this.listaMedidasFurgon = res[16];
        this.listaSuspension = res[17];
        this.listaRieles = res[18];
        this.listaMedidaLB = res[19];
        this.cargarDatos(Number.parseInt(this.activatedRoute.snapshot.paramMap.get("id")));
      });
    });
  }

  cargarDatos(id: number) {
    if (!this.isNuevo()) {
      this.form.addControl("idActivo", new FormControl());
      this.form.addControl("fechaCreacion", new FormControl());
      this.serviceComponent.getId(id).subscribe(res => {
        this.form.patchValue(res);
        this.form.controls["noEjes"].setValue(res.noEjes.toString());
        this.getTipoEquipoRemolque().pipe(first(val => val.length > 0)).subscribe(res => {
          this.tipoEquipoRemolque = res.filter(val => val.id == this.form.controls["idTipoEquipoRemolque"].value)[0];
          this.cargando = false;
        });
      });
    } else {
      this.cargando = false;
    }
  }

  mostrarCampo(campo: string): boolean {
    try {
      if (this.tipoEquipoRemolque) {
        if (this.tipoEquipoRemolque.estructuraCoc.toLowerCase().indexOf(campo.toLowerCase()) !== -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  getTipoEquipoRemolque() {
    return this.tipoEquipoRemolqueService.getDatos();
  }

  isNuevo() {
    if (this.activatedRoute.snapshot.paramMap.get("id")) {
      return false;
    } else {
      return true;
    }
  }

  guardarRegistro() {
    if (this.form.valid) {
      console.log(this.form.value);

      this.serviceComponent.crear(this.form.value).pipe(first())
        .subscribe(res => {
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
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", 'error');
      this.erroresActivoOperacion = [];
      this.form.markAllAsTouched();
    }
  }

  modificarRegistro() {
    if (this.form.valid) {
      this.serviceComponent.modificar(this.form.value).pipe(first())
        .subscribe(res => {
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
      this.sweetService.sweet_alerta("Error", "Complete los campos requeridos", 'error');
      this.erroresActivoOperacion = [];
      this.form.markAllAsTouched();
    }
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }

  getListaImagenesTC(imagenes: Imagen[]) {
    let imagenTarjetaCirculacion = this.form.controls["imagenTarjetaCirculacion"].value as ImagenRecurso;
    imagenTarjetaCirculacion.imagenes = imagenes;
    this.form.controls["imagenTarjetaCirculacion"].setValue(imagenTarjetaCirculacion);
  }

  getImagenesEliminarTC(imagenes: string[]) {
    let imagenTarjetaCirculacion: ImagenRecurso = { imagenesEliminar: [] };
    if (this.form.controls["imagenTarjetaCirculacion"].value) {
      imagenTarjetaCirculacion = this.form.controls["imagenTarjetaCirculacion"].value as ImagenRecurso;
    }
    imagenTarjetaCirculacion.imagenesEliminar = imagenes;
    this.form.controls["imagenTarjetaCirculacion"].setValue(imagenTarjetaCirculacion);
  }

  getImagenes(imagenes: Imagen[]) {
    let imagenTarjetaCirculacion: ImagenRecurso = { imagenes: [] };
    if (this.form.controls["imagenTarjetaCirculacion"].value) {
      imagenTarjetaCirculacion = this.form.controls["imagenTarjetaCirculacion"].value as ImagenRecurso;
    }
    imagenTarjetaCirculacion.imagenes = imagenTarjetaCirculacion.imagenes.filter(i => i.id).concat(imagenes);
    this.form.controls["imagenTarjetaCirculacion"].setValue(imagenTarjetaCirculacion);
  }

  getListaImagenesTarjetaCirculacion() {
    if (this.form.controls["imagenTarjetaCirculacion"].value) {
      return this.form.controls["imagenTarjetaCirculacion"].value.imagenes || [];
    } else {
      return [];
    }
  }

  getImagenRecurso() {
    //return this.serviceComponent.getImagenRecursoConfiguracion();
  }

  errores(validaciones: any) {
    let erroresAO: { [key: string]: any } = {}
    for (const validacion in validaciones) {
      var error = validaciones[validacion];
      if (validacion.startsWith("activoOperacion.")) {
        erroresAO[validacion.substring(16)] = error;
      }
      for (const codError in this.codErrores) {
        if (validacion.toLowerCase().trim() === codError.toLowerCase().trim()) {
          this.codErrores[codError] = error;
          this.form.get(codError).setErrors(["api"]);
          this.form.markAllAsTouched();
        }
      }
    }
    this.erroresActivoOperacion = erroresAO;
  }

}
