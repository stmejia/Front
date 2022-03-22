import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { QueryFilter } from '../../models/filtros';
import { TablaModalData } from '../../models/modal';
import { EventoPaginador, Paginador } from '../../models/paginador';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-aguila-tabla-modal',
  templateUrl: './aguila-tabla-modal.component.html',
  styleUrls: ['./aguila-tabla-modal.component.css']
})

export class AguilaTablaModalComponent implements OnInit {

  private datos = new BehaviorSubject<any[]>([]);
  private queryFilters: QueryFilter[] = [];
  private paginadorTabla = new BehaviorSubject<Paginador>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public data: TablaModalData, private http: HttpClient,
    private sweetService: SweetService) { }

  ngOnInit(): void {

  }

  eventConsultarDatos() {
    this.cargarPagina();
  }

  eventoPaginador(event: EventoPaginador) {
    this.queryFilters.forEach(f => {
      if (f.filtro == "PageNumber") {
        f.parametro = event.noPagina;
      }
    });
    this.cargarPagina();
  }

  getFiltros(filtros: QueryFilter[]) {
    this.queryFilters = filtros;
    this.queryFilters.push({ filtro: "PageNumber", parametro: 1 });
    this.setDatos([]);
    this.setPaginador(null);
  }

  cargarPagina() {
    this.sweetService.sweet_carga("Cargando Información");
    this.data.filtrosObligatorios.forEach(f => {
      if (!this.queryFilters.find(qf => qf.filtro == f.filtro)) {
        this.queryFilters.push(f);
      }
    });
    let filter = "?";
    for (let filtro of this.queryFilters) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }
    this.http.get(this.data.endPoint + filter).pipe(
      first(),
      tap((res: any) => this.configurarPaginador(res)),
      map((response: any) => response.aguilaData as any[]),
    ).subscribe(res => {
      this.setDatos(res);
      this.sweetService.sweet_notificacion("Listo", 1000, "info");
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_Error(error);
    });
  }

  setDatos(datos: any[]) {
    this.datos.next(datos);
  }

  getDatos() {
    return this.datos.asObservable();
  }

  configurarPaginador(res: any): void {
    var pa: number[] = [];
    for (let i = res.meta.currentPage - 2; i <= res.meta.currentPage + 2; i++) {
      if (i > 0 && i <= res.meta.totalPages) {
        pa.push(i);
      }
    }
    let paginador = res.meta as Paginador;
    paginador.paginas = pa;
    this.setPaginador(paginador);
  }

  setPaginador(paginador: Paginador) {
    this.paginadorTabla.next(paginador);
  }

  getPaginador() {
    return this.paginadorTabla.asObservable();
  }
}
