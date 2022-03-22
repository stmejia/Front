import { Injectable } from '@angular/core';
import { catchError, first, map } from 'rxjs/operators';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Empleado } from '../models/empleado';
import { PdfMakeWrapper, QR } from 'pdfmake-wrapper';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { COP } from 'src/app/@page/models/cop';
import { MatDialog } from '@angular/material/dialog';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService extends ServicioComponente {

  constructor(http: HttpClient, sw: SweetService, cs: ConfigService, modal: MatDialog) {
    super("/api/empleados", http, sw, cs, modal);
  }

  getId(id: number) {
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return;
    }
    this.sweetService.sweet_carga('Buscando. . .');
    return this.http.get(this.urlEndPoint + `/${id}`).pipe(
      first(),
      map((response: any) => response.aguilaData as Empleado)
    );
  }

  crear(item: Empleado) {
    if (!this.validarPermiso('Agregar')) {
      this.errorPermiso("Agregar");
      return;
    }
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      first()
    );
  }

  modificar(item: Empleado) {
    if (!this.validarPermiso('Modificar')) {
      this.errorPermiso("Modificar");
      return;
    }
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + `/${item.id}`, item).pipe(
      first(),
      map((res: any) => res.aguilaData as boolean)
    );
  }

  eliminar(id: number) {
    if (!this.validarPermiso('Eliminar')) {
      this.errorPermiso("Eliminar");
      return;
    }
    this.sweetService.sweet_carga('Espere...');
    return this.http.delete(this.urlEndPoint + `/${id}`).pipe(
      first(),
      map((response: any) => response.aguilaData as boolean)
    );
  }

  getCUI(cui: string) {
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return;
    }
    this.sweetService.sweet_carga('Buscando. . .');
    return this.http.get(this.urlEndPoint + `/empleado/${cui}`).pipe(
      first(),
      map((response: any) => response.aguilaData as Empleado)
    );
  }

  getListaCops() {
    return this.http.get("./assets/listas/cop.json").pipe(first(), map(res => res as COP));
  }

  cargarPaginaAusencias(filtros: QueryFilter[]) {
    this.sweetService.sweet_carga("Cargando Información");
    if (!this.validarPermiso('Consultar Ausencias')) {
      this.errorPermiso("Consultar Consultar Ausencias");
      return;
    }

    let filter = "?";
    for (let filtro of filtros) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }
    this.http.get(this.urlEndPoint + "/ausencias" + filter).pipe(
      first(),
      map((response: any) => response.aguilaData as any[]),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })).subscribe(res => {
        this.sweetService.sweet_notificacion("Listo", 1000, "info");
        this.setDatos(res);
      });
  }

  async imprimirEtiqueta(item: Empleado) {
    this.sweetService.sweet_carga('Generando Documento', true);
    let qrText = {
      codigo: item.codigo,
      td: this.getRecurso().controlador
    }
    let pdf: PdfMakeWrapper = new PdfMakeWrapper();
    pdf.pageSize({ width: 200, height: 300 });
    pdf.pageMargins([5, 5]);

    let imgQR = new QR(JSON.stringify(qrText)).fit(150).alignment("center").margin([0, 10]).eccLevel("M").end;
    // let logoEmpresa2 = await new Img("./assets/img/Logo_Nelogisa.png")
    //   .width(120).alignment("center").margin([10, 10]).build();

    //----- QR ----- \\
    pdf.add(imgQR);
    pdf.add([
      { text: item.nombres, fontSize: 14, alignment: "center", margin: 0, bold: true },
      { text: item.apellidos, fontSize: 14, alignment: "center", margin: 0, bold: true },
      { canvas: [{ type: "line", x1: 0, y1: 5, x2: 190, y2: 5, lineWidth: 2 }] },
      //logoEmpresa2
    ]);

    pdf.info({
      title: `${item.codigo}`
    })
    pdf.create().open();
    this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');

  }
}
