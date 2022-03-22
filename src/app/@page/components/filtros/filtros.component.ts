import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { FiltrosC, QueryFilter } from '../../models/filtros';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.css']
})
export class FiltrosComponent implements OnInit {

  @Input() filtros: FiltrosC[] = [];
  @Input() modal: boolean = false;
  @Output() queryFilters = new EventEmitter<QueryFilter[]>();
  @Output() clickConsultarDatos = new EventEmitter();

  private formatoFecha = environment.formatoFecha;

  constructor(private sweetService: SweetService) { }

  ngOnInit(): void {
  }

  ngOnChanges(cambios) {
    this.enviarFiltros();
  }

  enviarFiltros() {
    moment.locale("es-mx");
    let f: QueryFilter[] = [];
    this.filtros.forEach((filtro, i) => {
      if (filtro.tipo == "lista") {
        if (filtro.filters[0].parametro !== "") {
          f.push(filtro.filters[0]);
        }
      }
      if (filtro.tipo == "checkbox") {
        if (filtro.filters[0].parametro !== "") {
          f.push(filtro.filters[0]);
        }
      }
      if (filtro.tipo == "input") {
        if (filtro.filters[0].parametro !== "") {
          f.push(filtro.filters[0]);
        }
      }
      if (filtro.tipo == "rangoFechas") {
        if (filtro.filters[0].parametro !== "" && filtro.filters[1].parametro !== "") {
          f.push({ filtro: filtro.filters[0].filtro, parametro: moment(filtro.filters[0].parametro).format(this.formatoFecha) });
          f.push({ filtro: filtro.filters[1].filtro, parametro: moment(filtro.filters[1].parametro).format(this.formatoFecha) });
        }
      }
      if (filtro.tipo == "fecha") {
        if (filtro.filters[0].parametro !== "") {
          f.push({ filtro: filtro.filters[0].filtro, parametro: moment(filtro.filters[0].parametro).format(this.formatoFecha) });
        }
      }
    });
    this.queryFilters.emit(f);
  }

  limpiarFiltros() {
    this.filtros.forEach((filtro, i) => {
      if (filtro.activo) {
        this.filtros[i].filters.forEach(f => { f.parametro = "" });
      }
    });
    this.enviarFiltros();
  }

  aplicarFiltro() {
    let f = this.filtros.filter(f => {
      if (f.requerido) {
        if (f.filters.filter(t => t.parametro == "").length > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false
      }
    });
    if (f.length > 0) {
      this.sweetService.sweet_alerta("Filtros Requeridos", "Debe establecer valores para los filtros requeridos", "error");
      return;
    }
    this.clickConsultarDatos.emit();
  }

  getCSS() {
    return this.modal == false ? { "col-sm-6 col-md-4 col-lg-2": true } : { "col-sm-6 col-md-6 col-lg-4": true };
  }

  getItemSelectCheckBox(filtro: FiltrosC) {
    if (filtro.filters[0].parametro.length > 0) {
      return filtro.valores.find(el => el.valor == filtro.filters[0].parametro[0]).nombre;
    } else {
      return '';
    }
  }
}
