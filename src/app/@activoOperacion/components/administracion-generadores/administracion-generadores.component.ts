import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { Generador } from 'src/app/@catalogos/data/models/generador';
import { Lista } from 'src/app/@catalogos/data/models/lista';
import { TipoGenerador } from 'src/app/@catalogos/data/models/tipoGenerador';
import { TipoLista } from 'src/app/@catalogos/data/models/tipoLista';
import { ActivoOperacionService } from 'src/app/@catalogos/data/services/activo-operacion.service';
import { ListaService } from 'src/app/@catalogos/data/services/lista.service';
import { TipoListaService } from 'src/app/@catalogos/data/services/tipo-lista.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { Columna } from 'src/app/@page/models/columna';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { EventoMenuOpciones } from 'src/app/@page/models/menu';
import { EventoPaginador } from 'src/app/@page/models/paginador';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';
import { ReportesService } from 'src/app/@page/services/reportes.service';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { SweetAlertOptions } from 'sweetalert2';
import { EventosControlEquipo } from '../../data/models/eventosControlEquipo';
import { ControlEventosEquiposService } from '../../data/services/control-eventos-equipos.service';
import { ControlGeneradoresService } from '../../data/services/control-generadores.service';

@Component({
  selector: 'app-administracion-generadores',
  templateUrl: './administracion-generadores.component.html',
  styleUrls: ['./administracion-generadores.component.css']
})
export class AdministracionGeneradoresComponent implements OnInit {

  cargando: boolean = true;
  rutaComponent: string = "";
  tipoGenerador: TipoGenerador = null;

  columnas: ColumnaTabla[] = [
    { titulo: 'settings', target: [''], tipo: 'opcion', aligment: 'center', visible: true },
    { titulo: 'Código', target: ["activoOperacion", "codigo"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'COC', target: ["activoOperacion", "coc"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Transporte', target: ["activoOperacion", "transporte", "nombre"], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Lugar', target: ['activoOperacion', 'movimientoActual', 'lugar'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'Estado', target: ['activoOperacion', 'movimientoActual', 'estado', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Disponible', target: ['activoOperacion', 'movimientoActual', 'estado', 'disponible'], tipo: 'boolean', aligment: 'center', visible: true },
    { titulo: "Dias S/Mov.", target: ["activoOperacion", "movimientoActual", "vDiasUltMov"], tipo: "texto", aligment: "right", visible: true },
    { titulo: 'U. Servicio', target: ['activoOperacion', 'movimientoActual', 'servicio', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'U. Ruta', target: ['activoOperacion', 'movimientoActual', 'ruta', 'nombre'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: "Piloto", target: ["activoOperacion", "movimientoActual", "empleado", "nombres"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["activoOperacion", "movimientoActual", "usuario", "nombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Observaciones", target: ["activoOperacion", "movimientoActual", "observaciones"], tipo: "texto", aligment: "left", visible: true }
  ];

  colTipoGenerador: Columna[] = [
    { nombre: "Prefijo", aligment: "left", targetId: "prefijo", tipo: "texto" },
    { nombre: "Descripcion", aligment: "left", targetId: "descripcion", tipo: "texto" }
  ];

  filtros: QueryFilter[] = [
    { filtro: "PageNumber", parametro: "1" }, // 0
    { filtro: "idTipoGenerador", parametro: "" }, // 1
    { filtro: "equipoActivo", parametro: "" }, // 2
    { filtro: "propio", parametro: "" }, //3
    { filtro: "idEstado", parametro: "" }, //4

    //
    { filtro: "marcaGenerador", parametro: "" }, //5
    { filtro: "tipoInstalacion", parametro: "" }, //6
    { filtro: "global", parametro: false }, //7
    { filtro: "idEstacionTrabajo", parametro: "" }, //8

  ]

  TL_MarcaGenerador: TipoLista;
  TL_TipoInstalacion: TipoLista;
  TL_Flota: TipoLista;

  listaMarcaGenerador: Lista[] = [];
  listaTipoInstalacion: Lista[] = [];
  listaFlota: Lista[] = [];
  listaEstados: Estados[] = [];

  colEstadosActivo: Columna[] = [
    { nombre: "Código", aligment: "center", targetId: "codigo", tipo: "texto" },
    { nombre: "Nombre", aligment: "left", targetId: "nombre", tipo: "texto" },
  ];

  constructor(private serviceComponent: ControlGeneradoresService, private sweetService: SweetService,
    private router: Router, private tipoListaService: TipoListaService, private listaService: ListaService,
    private reporteService: ReportesService, private activoOperacionService: ActivoOperacionService) { }

  ngOnInit(): void {
    forkJoin([
      this.serviceComponent.getCargando().pipe(first(value => value === false)),
      this.tipoListaService.getCargando().pipe(first(val => val === false)),
      this.listaService.getCargando().pipe(first(val => val === false)),
      this.activoOperacionService.getCargando().pipe(first(val => val === false)),
    ]).subscribe(res => {
      this.validarPermiso();
    });
  }

  eventoMenuOpciones(event: EventoMenuOpciones) {
    switch (event.idEvento) {
      case 1:
        this.router.navigate([this.rutaComponent, event.objeto.idActivo]);
        break;
      case 2:
        this.ponerEnBodega(event.objeto)
        break;
      case 3:
        this.ponerEnReparacion(event.objeto)
        break;
      case 4:
        this.ponerEnRentaInterna(event.objeto)
        break;
      case 5:
        this.ponerEnRentaExterna(event.objeto)
        break;
      case 6:
        this.ponerEnRuta(event.objeto)
        break;
      case 7:
        this.crearEvento(event.objeto)
        break;
      case 8:
        this.ponerDisponible(event.objeto)
        break;
    }
  }

  eventoPaginador(event: EventoPaginador) {
    this.cargarPagina(event.noPagina);
  }

  cargarComponent() {
    if (this.router.url.endsWith('administracionGeneradores')) {
      this.rutaComponent = this.router.url;
      this.serviceComponent.setConfiguracionComponent({
        header: {
          titulo: "Administración De Generadores",
          opciones: []
        },
        isModal: false
      });
      this.serviceComponent.setMenuOpcionesTabla([
        { icono: "find_in_page", nombre: "Consultar Movimientos", idEvento: 1, disponible: this.opcionDisponible("Consultar") },
        { icono: "garage", nombre: "Poner En Bodega", idEvento: 2, disponible: this.opcionDisponible("PonerBodega") },
        { icono: "build", nombre: "Enviar A Reparación", idEvento: 3, disponible: this.opcionDisponible("PonerReparacion") },
        { icono: "rv_hookup", nombre: "Renta Interna", idEvento: 4, disponible: this.opcionDisponible("RentaInterna") },
        { icono: "rv_hookup", nombre: "Renta Externa", idEvento: 5, disponible: this.opcionDisponible("RentaExterna") },
        { icono: "add_road", nombre: "Enviar A Ruta", idEvento: 6, disponible: this.opcionDisponible("EnviarRuta") },
        { icono: "report_problem", nombre: "Crear Evento", idEvento: 7, disponible: this.opcionDisponible("AgregarEvento") },
        { icono: "task_alt", nombre: "Poner En Disponible", idEvento: 8, disponible: this.opcionDisponible("Poner Disponible") },
      ]);
      this.cargarTiposLista();
    } else {
      this.cargando = false;
    }
  }

  cargarTiposLista() {
    forkJoin([
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoGenerador().id, "marcaGenerador").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.serviceComponent.getRecursoGenerador().id, "tipoInstalacion").pipe(first()),
      this.tipoListaService.getIdRecursoCampo(this.activoOperacionService.getRecurso().id, "flota").pipe(first()),
    ]).subscribe(res => {
      this.TL_MarcaGenerador = res[0][0];
      this.TL_TipoInstalacion = res[1][0];
      this.TL_Flota = res[2][0];
      this.cargarListas();
    });
  }

  cargarListas() {
    forkJoin([
      this.listaService.cargarPagina(this.TL_MarcaGenerador.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_TipoInstalacion.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.listaService.cargarPagina(this.TL_Flota.id, this.serviceComponent.getEmpresa().id).pipe(first()),
      this.serviceComponent.getEstados(),
    ]).pipe(first()).subscribe(res => {
      this.listaMarcaGenerador = res[0];
      this.listaTipoInstalacion = res[1];
      this.listaFlota = res[2] as Lista[];
      this.listaEstados = res[3] as Estados[];
      this.cargando = false;
    });
  }

  limpiarFiltros() {
    this.filtros.forEach(f => {
      if (!f.filtro.includes('global')) {
        f.parametro = "";
      }
    });
    this.tipoGenerador = null;
  }

  getTiposGeneradores() {
    return this.serviceComponent.getTiposGeneradores();
  }

  cargarPagina(noPagina) {
    this.filtros.forEach((f, i) => {
      if (f.filtro == "PageNumber") {
        this.filtros[i].parametro = noPagina;
      }
      if (f.filtro == "idTipoVehiculo" && this.tipoGenerador) {
        this.filtros[i].parametro = this.tipoGenerador.id
      }
      if (f.filtro == "idEstacionTrabajo") {
        this.filtros[i].parametro = this.serviceComponent.getEstacionTrabajo().id;
      }
    });
    this.serviceComponent.cargarPagina(this.filtros.filter(f => f.parametro !== ""));
  }

  ponerEnBodega(equipo: Generador) {
    if (equipo.activoOperacion.movimientoActual.estado.evento.toLocaleLowerCase().includes("egresado")) {
      let opt: SweetAlertOptions = {
        title: "¿Poner En Bodega?",
        icon: "question",
        heightAuto: false,
        showCancelButton: true,
        input: "textarea",
        confirmButtonText: "Poner En Bodega",
        html: `
        <p class="text-left text-bold">¿Desea asignar el equipo ${equipo.activoOperacion.codigo} a bodega del cliente?</p>
        <p>Observaciones: </p>
        `
      }
      this.sweetService.sweet_custom(opt).then(r => {
        if (r.isConfirmed) {
          let reserva: any = {
            idActivo: equipo.idActivo,
            idEmpresa: this.serviceComponent.getEmpresa().id,
            idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
            idUsuario: this.serviceComponent.getUsuario().id,
            //documento: equipo.activoOperacion.movimientoActual.documento,
            lugar: this.serviceComponent.getEstacionTrabajo().nombre,
            observaciones: r.value ? r.value : ''
          }

          this.serviceComponent.ponerBodegaEquipo(reserva).pipe(first()).subscribe(res => {
            this.sweetService.sweet_notificacion("Equipo asignao a bodega de cliente");
            this.cargarPagina(1);
          });
        }
      })
    } else {
      this.sweetService.sweet_alerta("Error", "El equipo debe estar en ruta", "error");
    }
  }

  ponerEnReparacion(equipo: Generador) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Reparación?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Reparación",
      html: `
      <p class="text-left text-bold">¿Desea enviar a reparación el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }

        this.serviceComponent.enviarReparacionEquipo(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a reparación");
          this.cargarPagina(1);
        });
      }
    })
  }

  ponerEnRentaInterna(equipo: Generador) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Renta Interna?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Renta Interna",
      html: `
      <p class="text-left text-bold">¿Desea enviar a renta interna el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }

        this.serviceComponent.evniarRentaInternaEquipo(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a renta interna");
          this.cargarPagina(1);
        });
      }
    })
  }

  ponerEnRentaExterna(equipo: Generador) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Renta Externa?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Renta Externa",
      html: `
      <p class="text-left text-bold">¿Desea enviar a renta externa el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }

        this.serviceComponent.evniarRentaExternaEquipo(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a renta externa");
          this.cargarPagina(1);
        });
      }
    })
  }

  ponerEnRuta(equipo: Generador) {
    let opt: SweetAlertOptions = {
      title: "¿Enviar A Ruta?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Enviar A Ruta",
      html: `
      <p class="text-left text-bold">¿Desea enviar a ruta el equipo ${equipo.activoOperacion.codigo}?</p>
      <p>Observaciones: </p>
      `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }

        this.serviceComponent.enviarRuta(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("Equipo enviado a ruta");
          this.cargarPagina(1);
        });
      }
    })
  }

  crearEvento(equipo: Generador) {
    let opt: SweetAlertOptions = {
      title: "Crear Evento",
      heightAuto: false,
      icon: 'warning',
      showCancelButton: true,
      //input: "textarea",
      confirmButtonText: "Crear Evento",
      html: `
      <p class="text-left p-0 m-0"><b>Código De Equipo: </b>${equipo.activoOperacion.codigo}</p>
      <p class="text-left p-0 m-0 pt-10"><b>Titulo De Evento:</b> </p>
      <input id="swal-input1" class="swal2-input p-0 m-0">
      <p class="text-left p-0 m-0 pt-10"><b>Observaciones:</b> </p>
      <textarea id="swal-input2" class="swal2-input p-0 m-0"></textarea>
      `,
      preConfirm: () => {
        return [
          (<HTMLInputElement>document.getElementById('swal-input1')).value,
          (<HTMLTextAreaElement>document.getElementById('swal-input2')).value
        ]
      }
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        console.log(r.value);
        if (r.value[0].trim().length < 5) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar un Titulo Valido para el Evento.', 'error');
          return;
        }
        if (r.value[1].trim().length < 5) {
          this.sweetService.sweet_alerta('Error', 'Debe proporcionar una Observación Valida para el Evento.', 'error');
          return;
        }

        let eventoRevisa: EventosControlEquipo = {
          idActivo: equipo.activoOperacion.id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          descripcionEvento: r.value[0],
          bitacoraObservaciones: r.value[1],
          idUsuarioRevisa: this.serviceComponent.getUsuario().id,
        }
        this.serviceComponent.crearEvento(eventoRevisa).subscribe(res => {
          this.sweetService.sweet_notificacion('Registro Guardado', 5000, 'info');
        });
      }
    });
  }

  ponerDisponible(equipo: Generador) {
    if (!this.serviceComponent.validarPermiso("Poner Disponible")) {
      this.serviceComponent.errorPermiso("Poner En Disponible");
      return;
    }

    let opt: SweetAlertOptions = {
      title: "¿Poner El Equipo Disponible?",
      icon: "question",
      heightAuto: false,
      showCancelButton: true,
      input: "textarea",
      confirmButtonText: "Poner En Disponible",
      html: `
        <p class="text-left text-bold">¿Desea colocar el equipo ${equipo.activoOperacion.codigo} como disponible?</p>
        <p>Observaciones: </p>
        `
    }
    this.sweetService.sweet_custom(opt).then(r => {
      if (r.isConfirmed) {
        let reserva: any = {
          idActivo: equipo.idActivo,
          idEmpresa: this.serviceComponent.getEmpresa().id,
          idEstacionTrabajo: this.serviceComponent.getEstacionTrabajo().id,
          idUsuario: this.serviceComponent.getUsuario().id,
          lugar: this.serviceComponent.getEstacionTrabajo().nombre,
          observaciones: r.value ? r.value : ''
        }

        this.serviceComponent.ponerDisponible(reserva).pipe(first()).subscribe(res => {
          this.sweetService.sweet_notificacion("El equipo ha sido colocado como disponible", 5000, 'info');
          this.cargarPagina(1);
        });
      }
    })
  }

  validarPermiso() {
    if (this.serviceComponent.validarPermiso('Consultar')) {
      this.cargarComponent();
    } else {
      this.serviceComponent.errorPermiso("Consultar");
      this.serviceComponent.paginaAnterior();
    }
  }

  opcionDisponible(opcion: string): boolean {
    return this.serviceComponent.validarPermiso(opcion);
  }

  getDatos() {
    return this.serviceComponent.getDatos();
  }

  getEstadosActivo() {
    //return this.estadosService.getDatos();
  }

  getTipoEquipoSelect() {
    if (this.tipoGenerador) {
      return this.tipoGenerador.id
    } else {
      return "";
    }
  }

  getPaginador() {
    return this.serviceComponent.getPaginador();
  }

  mostrarCampo(campo: string): boolean {
    try {
      if (this.tipoGenerador) {
        if (this.tipoGenerador.estructuraCoc.toLocaleLowerCase().indexOf(campo.toLocaleLowerCase()) !== -1) {
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

  getOpcionesTabla() {
    return this.serviceComponent.getMenuOpcionesTabla();
  }

  generarExcel(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Administración De Vehículos", bold: true, size: 14 },
      ]
    }

    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }

    this.reporteService.generarExcelTabla(evento.columnas, evento.datos, titulos);
  }

  generarPdf(evento) {
    let titulos: TitulosReporte = {
      titulo: {
        text: this.serviceComponent.getEmpresa().nombre,
        bold: true,
        size: 16
      },
      subTitulos: [
        { text: "Administración De Vehículos", bold: true, size: 18 }
      ]
    }
    let filtrosAplicados = this.getSubtituloFiltrosAplicados();

    if (filtrosAplicados.length > 20) {
      titulos.subTitulos.push({ text: filtrosAplicados, bold: false, size: 10 })
    }
    this.reporteService.generarPDFTabla(evento.columnas, evento.datos, titulos);
  }

  getSubtituloFiltrosAplicados() {
    let filtrosAplicados = "Filtros Aplicados: ";
    this.filtros.forEach((f, i) => {
      if (f.parametro !== "") {
        switch (f.filtro) {
          case "idTipoGenerador":
            filtrosAplicados += ` -Tipo De Vehiculo: ${this.serviceComponent.getTiposGeneradoresValue().find(t => t.id.toString() == f.parametro).prefijo}`;
            break;
          case "flota":
            filtrosAplicados += ` -Flota: ${f.parametro}`;
            break;
          case "propio":
            filtrosAplicados += ` -Equipo Propio: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "equipoActivo":
            filtrosAplicados += ` -Equipo Activo: ${f.parametro ? 'Si' : 'No'}`;
            break;
          case "idEstado":
            filtrosAplicados += ` -Estado: ${this.listaEstados.find(t => t.id.toString() == f.parametro).nombre}`;
            break;
          case "marcaGenerador":
            filtrosAplicados += ` -Marca: ${f.parametro}`;
            break;
          case "tipoInstalacion":
            filtrosAplicados += ` -T. Instalación: ${f.parametro}`;
            break;

          case "global":
            filtrosAplicados += ` -Global: ${f.parametro ? 'Si' : 'No'}`
            break;
        }
      }
    });
    return filtrosAplicados;
  }

  limpiarDatos() {
    this.serviceComponent.setDatos([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.", 5000, "info");
  }

  get configuracionComponent() {
    return this.serviceComponent.getConfiguracionComponent();
  }
}
