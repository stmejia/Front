import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Vehiculo } from 'src/app/@catalogos/data/models/vehiculo';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { EventoPaginador, Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-solicitudes-reservas',
  templateUrl: './solicitudes-reservas.component.html',
  styleUrls: ['./solicitudes-reservas.component.css']
})
export class SolicitudesReservasComponent implements OnInit {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/controlEquipo/SolicitudesReservasAltas";
  private datos = new BehaviorSubject<any[]>([]);
  private queryFilters: QueryFilter[] = [];
  private columnasTabla: ColumnaTabla[] = [
    { titulo: "Fecha Posicionamiento", target: ["solicitudMovimiento", "soliFchMov"], tipo: "fecha", aligment: "left", visible: true },
    { titulo: "Movimiento", target: ["solicitudMovimiento", "tipoMovimiento", "tpMvCodigo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Solicitud", target: [], targetConcatenar: [["solicitudMovimiento", "tipoDocumento", "tpDcCodigo"], ["solicitudMovimiento", "soliCodigo"]], caracterConcatenar: "", tipo: "concatenar", aligment: "left", visible: true },
    { titulo: "No", target: ["slMINumero"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Servicio", target: ["servicio", "servCodigo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Tipo Contenedor", target: ["tipoContenedor", "tpCnCodigo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Contenedor", target: [""], targetConcatenar: [["slMIContPref"], ["slMIContNumero"]], caracterConcatenar: "", tipo: "concatenar", aligment: "left", visible: true },
    { titulo: "Peso", target: ["slMIPeso"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Marchamo", target: ["slMIMarchamo"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Seguridad", target: ["slMISeguridad"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Cliente", target: ["solicitudMovimiento", "clientes", "clieNombre"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Consignatario", target: ["solicitudMovimiento", "soliConsignatario"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Booking", target: ["slMIBooking"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Origen", target: ["solicitudMovimiento", "soliDirOrigen"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Destino", target: ["solicitudMovimiento", "soliDirDestino"], tipo: "texto", aligment: "left", visible: true },
    { titulo: "Usuario", target: ["usuario", "usua_nombre"], tipo: "texto", aligment: "left", visible: true },
  ]
  private filtrosComponent: FiltrosC[] = [
    {
      nombre: "Solicitudes Del:", valores: [], filters: [{ filtro: "solicitudDel", parametro: "" }],
      tipo: "input", tipoInput: "number", activo: true, requerido: false
    },
    {
      nombre: "Solicitudes Al:", valores: [], filters: [{ filtro: "solicitudAl", parametro: "" }],
      tipo: "input", tipoInput: "number", activo: true, requerido: false
    },
    {
      nombre: "Prefijo De Contenedor:", valores: [], filters: [{ filtro: "contenedorPrefijo", parametro: "" }],
      tipo: "input", tipoInput: "string", activo: true, requerido: false
    },
    {
      nombre: "No. De Contenedor:", valores: [], filters: [{ filtro: "contenedorNumero", parametro: "" }],
      tipo: "input", tipoInput: "string", activo: true, requerido: false
    },
    {
      nombre: "Codigo De Cliente:", valores: [], filters: [{ filtro: "clienteCodigo", parametro: "" }],
      tipo: "input", tipoInput: "number", activo: true, requerido: false
    },
    {
      nombre: "Nombre De Cliente:", valores: [], filters: [{ filtro: "ClienteNombre", parametro: "" }],
      tipo: "input", tipoInput: "string", activo: true, requerido: false
    },
    {
      nombre: "Booking:", valores: [], filters: [{ filtro: "booking", parametro: "" }],
      tipo: "input", tipoInput: "string", activo: true, requerido: false
    },
    {
      nombre: "Documento:", valores: [{ nombre: "Envios", valor: "Envio" }, { nombre: "Traslados", valor: "Traslado" }], filters: [{ filtro: "documento", parametro: "Envio" }],
      tipo: "lista", activo: true, requerido: true
    },
    {
      nombre: "Fecha De Solicitudes", valores: [
        { nombre: "Del", valor: "" },
        { nombre: "Al", valor: "" }],
      filters: [{ filtro: "fechaDel", parametro: "" }, { filtro: "fechaAl", parametro: "" }],
      tipo: "rangoFechas",
      activo: true,
      requerido: true,
    }
  ]
  private paginador = new BehaviorSubject<Paginador>(null);
  cargando: boolean = true;

  constructor(private configService: ConfigService, private http: HttpClient, private sweetService: SweetService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  eventoPaginador(event: EventoPaginador) {
    this.queryFilters.forEach((f, i) => {
      if (f.filtro == "PageNumber") {
        this.queryFilters[i].parametro = event.noPagina;
      }
    });
    this.cargarPaginaFiltros();
  }

  cargarDatos() {
    this.cargando = false;
  }

  getFiltros(filtros: QueryFilter[]) {
    this.queryFilters = filtros;
    this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
    this.queryFilters.push({ filtro: "estacionTrabajoId", parametro: this.configService.getEstacionTrabajoV().id });
    this.datos.next([]);
    this.sweetService.sweet_notificacion("Los filtros han cambiado, vuelve a cargar los datos.");
  }

  cargarPaginaFiltros() {
    this.sweetService.sweet_carga("Espere", true);

    let filter = "?";
    for (let filtro of this.queryFilters) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }

    this.http.get(this.urlEndPoint + filter).pipe(
      first(),
      tap((res: any) => this.configurarPaginador(res)),
      map((response: any) => response.aguilaData as Vehiculo[]),
      tap((res) => this.datos.next(res)),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return [];
      })).subscribe(() => this.sweetService.sweet_notificacion("Listo", 2000));
  }

  getFiltrosComponent(): FiltrosC[] {
    return this.filtrosComponent;
  }

  getDatos() {
    return this.datos.asObservable();
  }

  getColumnas(): ColumnaTabla[] {
    return this.columnasTabla;
  }

  configurarPaginador(res: any) {
    var pa: number[] = [];
    for (let i = res.meta.currentPage - 2; i <= res.meta.currentPage + 2; i++) {
      if (i > 0 && i <= res.meta.totalPages) {
        pa.push(i);
      }
    }
    let paginador = res.meta as Paginador;
    paginador.paginas = pa;
    this.paginador.next(paginador)
  }

  getPaginador() {
    return this.paginador.asObservable();
  }
}
