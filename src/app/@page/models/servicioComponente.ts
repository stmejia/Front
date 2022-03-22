import { BehaviorSubject, forkJoin, Observable, throwError } from "rxjs";
import { Empresa } from "src/app/@aguila/data/models/empresa";
import { Estaciontrabajo } from "src/app/@aguila/data/models/estaciontrabajo";
import { Recurso } from "src/app/@aguila/data/models/recurso";
import { ConfiguracionComponent } from "./configComponent";
import { MenuOpciones } from "./menu";
import { Paginador } from "./paginador";
import { FiltrosC, QueryFilter } from "./filtros";
import { ColumnaTabla } from "./aguilaTabla";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { catchError, first, map, tap } from "rxjs/operators";
import { SweetService } from "../services/sweet.service";
import { ConfigService } from "src/app/@aguila/data/services/config.service";
import { TipoLista } from "src/app/@catalogos/data/models/tipoLista";
import { AguilaResponse } from "./aguilaResponse";
import { Lista } from "src/app/@catalogos/data/models/lista";
import { Img, PdfMakeWrapper, Table } from "pdfmake-wrapper";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ListaGeneral } from "./listaGeneral";
import { MatDialog } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { SweetAlertOptions } from "sweetalert2";
import { ImagenRecursoConfiguracion } from "src/app/@aguila/data/models/imagenRecursoConfiguracion";
import { TitulosReporte } from "./titulosReporte";
import * as moment from "moment";
import { Workbook } from "exceljs";
import * as fs from 'file-saver';
import { Imagen } from "src/app/@aguila/data/models/imagen";
export class ServicioComponente {

    //Guarda la url del EndPoint
    protected urlBase: string = environment.UrlAguilaApi;
    protected urlEndPoint: string = environment.UrlAguilaApi;
    protected urlTipoLista: string = environment.UrlAguilaApi + "/api/tiposLista";
    protected urlLista: string = environment.UrlAguilaApi + "/api/listas";

    //Guarda la Estacion De Trabjo en la que se esta trabajando
    protected estacion: Estaciontrabajo;

    //Guarda la configuracion que tendra el componente
    protected configComponent = new BehaviorSubject<any>(null);

    //Guarda el recurso del servicio
    protected recurso = new BehaviorSubject<Recurso>(null);

    //Guarda el estado del service, si se encuentra cargando informacion
    protected cargando = new BehaviorSubject<boolean>(true);

    //Guarda las opciones que tendra cada elemento de una tabla
    protected menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);

    //Guarda las columnas que tendra la tabla
    protected columnasTabla = new BehaviorSubject<ColumnaTabla[]>([]);

    //Guarda el paginador de la tabla
    protected paginadorTabla = new BehaviorSubject<Paginador>(null);

    //Almacena los datos generador por el usuario
    protected listaDatos = new BehaviorSubject<any[]>([]);

    //Almacena  
    protected filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
    protected formatoFechaHora: string = environment.formatoFechaHora;

    protected peticiones: Observable<any>[] = [];
    formatoFecha: string = "DD/MM/YYYY";

    constructor(private endPoint: string, protected http: HttpClient, protected sweetService: SweetService,
        protected configService: ConfigService, protected modal?: MatDialog,) {
        this.urlEndPoint += this.endPoint;
        PdfMakeWrapper.setFonts(pdfFonts);

        forkJoin([
            this.cargarRecurso().pipe(first(val => val != null))
        ]).subscribe(res => {
            this.cargarEstacionTrabajo();
        }, (error) => {
            this.sweetService.sweet_Error(error);
        });
    }

    cargarRecurso(): Observable<Recurso> {
        this.setCargando(true);
        return this.http.options(this.urlEndPoint).pipe(
            map((response: any) => response.aguilaData as Recurso),
            tap(recurso => {
                this.recurso.next(recurso);
            })
        )
    };

    /*
    Metodo para tener la Estacion de Trabajo donde se esta trabajando
    Se obtiene mediante el servicio ConfigService ejecutnado el metodo getEstacionTrabajo()
    */
    cargarEstacionTrabajo(): void {
        this.configService.getEstacionTrabajo().subscribe(res => {
            this.estacion = res.estacionTrabajo;
            this.limpiarVariables();
            this.setCargando(false);
        });
    };

    /*
    Metodo que se debera ejecutar cada vez que se cambie de estacion de trabajo
    Se deberan limpiar todas las variables (listas a []) (variables a null)
    */
    limpiarVariables(): void {
        this.setDatos([]);
        this.setPaginador(null);
        this.setColumnas([]);
        this.setConfiguracionComponent(null);
        this.setMenuOpcionesTabla([]);
    };

    /* Metodo para validar si el usuario posee algun permiso */
    validarPermiso(permiso: string): boolean {
        return this.configService.opcionDisponible(this.recurso.value.id, permiso);
    }

    /* 
    Metodo para setear el estado del servicio por medio de un boolean, esto permite 
    que los componentes esperen a que el Servicio tenga en memoria los valores necesarios
    antes de ejecutar un metodo
    */
    setCargando(estado: boolean): void {
        this.cargando.next(estado);
    }

    /* Metodo que devuelve el estado del servicio*/
    getCargando(): Observable<boolean> {
        return this.cargando.asObservable();
    }

    /* Metodo que devuelve el Recurso del Servicio */
    getRecurso(): Recurso {
        return this.recurso.value;
    }

    /* Metodo que devuelve la empresa en la que se esta trabajando */
    getEmpresa(): Empresa {
        return this.estacion.sucursal.empresa;
    }

    getEmpresasAsignadas(): Observable<Empresa[]> {
        return this.configService.getEmpresasAsignadas();
    }

    getEmpresasAsignadasValue(): Empresa[] {
        return this.configService.getEmpresasAsignadasValue();
    }

    /* Metodo que notifica al usuario cuando no posee algun permiso */
    errorPermiso(permiso: string): void {
        this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
    }

    /* Metodo que devuelve la estacion de trabajo donde se esta trabajando */
    getEstacionTrabajo(): Estaciontrabajo {
        return this.estacion;
    }

    /* Metodo para regresar a la pagina anterior */
    paginaAnterior(): void {
        this.configService.regresar();
    }

    /* Asigna la configuracion que tendra el componente */
    setConfiguracionComponent(configuracionComponent: ConfiguracionComponent): void {
        this.configComponent.next(configuracionComponent);
    }

    /* Devuelve la configuracion que debe tener el componente */
    getConfiguracionComponent(): Observable<ConfiguracionComponent> {
        return this.configComponent.asObservable();
    }

    getConfiguracionComponentValue(): ConfiguracionComponent {
        return this.configComponent.value;
    }
    /* Asigna las opciones que tendra cada item de la tabla */
    setMenuOpcionesTabla(menuOpciones: MenuOpciones[]): void {
        this.menuOpcionesTabla.next(menuOpciones);
    }

    /* Devuelve las opciones que tendra cada item de la tabla */
    getMenuOpcionesTabla(): Observable<MenuOpciones[]> {
        return this.menuOpcionesTabla.asObservable();
    }

    /* Metodo que configura el paginador */
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

    /* Asigna el paginador */
    setPaginador(paginador: Paginador): void {
        this.paginadorTabla.next(paginador);
    }

    /* Devuelve el paginador */
    getPaginador(): Observable<Paginador> {
        return this.paginadorTabla.asObservable();
    }

    /* Asigna las columnas */
    setColumnas(columnas: ColumnaTabla[]) {
        this.columnasTabla.next(columnas);
    }

    /* Devuelve las columnas */
    getColumnas(): Observable<ColumnaTabla[]> {
        return this.columnasTabla.asObservable();
    }

    /* Carga una pagina en base a filtros */
    cargarPagina(filtros: QueryFilter[]): void {
        this.sweetService.sweet_carga("Cargando Información");
        if (!this.validarPermiso('Consultar')) {
            this.errorPermiso("Consultar");
            return;
        }

        let filter = "?";
        for (let filtro of filtros) {
            filter += `${filtro.filtro}=${filtro.parametro}&`
        }
        filter += "idEmpresa=" + this.estacion.sucursal.empresa.id;
        this.http.get(this.urlEndPoint + filter).pipe(
            first(),
            tap((res: any) => this.configurarPaginador(res)),
            map((response: any) => response.aguilaData as any[]),
            catchError((e) => {
                this.sweetService.sweet_Error(e);
                return throwError(e);
            })).subscribe(res => {
                this.sweetService.sweet_notificacion("Listo", 1000, "info");
                this.setDatos(res);
            });
    }

    /* Devuelve los datos generados por el usuario a travez del EndPoint */
    getDatos(): Observable<any[]> {
        return this.listaDatos.asObservable();
    }

    /* Setea los datos que genere el usuario a travez del EndPoint*/
    setDatos(lista: any[]): void {
        this.listaDatos.next(lista);
    }

    /* Devuelve el formato de Fecha Y Hora a utilizar */
    getFormatoFechaHora() {
        return this.formatoFechaHora;
    }

    /* Asigna los filtro que tendra la pantalla de consulta de datos */
    setFiltrosComponent(filtros: FiltrosC[]) {
        this.filtrosComponent.next(filtros);
    }

    /* Devuelve los filtros asignados*/
    getFiltrosComponent(): Observable<FiltrosC[]> {
        return this.filtrosComponent.asObservable();
    }

    navegar(ruta: string[]) {
        this.configService.navegar(ruta);
    }

    getTiposLista() {
        return this.http.get(this.urlTipoLista + `?idRecurso=${this.getRecurso().id}`)
            .pipe(first(), map((response: any) => response.aguilaData as TipoLista[]),)
    }

    getLista(idTipoLista: number) {
        return this.http.get(this.urlLista + `?idEmpresa=${this.getEmpresa().id}&idTipoLista=${idTipoLista}`)
            .pipe(
                first(),
                map((res: any) => res as AguilaResponse<Lista>)
            );
    }

    getListas(campo) {
        return this.http.get(this.urlTipoLista + `/lista?idRecurso=${this.getRecurso().id}&campo=${campo}&idEmpresa=${this.getEmpresa().id}`)
            .pipe(first(), map((res: AguilaResponse<Lista[]>) => res.aguilaData));
    }

    getListaJSON(file) {
        return this.http.get(`./assets/listas/${file}.json`).pipe(first(), map(res => res as ListaGeneral[]));
    }

    getImagenRecurso(propiedad) {
        return this.configService.getImagenRecursoConfiguracion(this.recurso.value.id, propiedad);
    }

    getImagenRecursoConfiguracion(propiedad: string) {
        return this.http.get(this.urlEndPoint + "/ImagenConfiguracion/" + propiedad).pipe(
            first(), map((res: AguilaResponse<ImagenRecursoConfiguracion>) => res.aguilaData)
        );
    }

    abrirModal(component: ComponentType<any>, data?: any) {
        return this.modal.open(component, data).afterClosed();
    }

    getUrlEndPoint() {
        return this.urlEndPoint;
    }

    getUrlBase() {
        return this.urlBase;
    }

    getHttp() {
        return this.http;
    }

    erroresValidacion(errores: any) {
        let cuerpo = "<ol>";
        for (const propiedad in errores) {
            let item = `<li><b>${propiedad}</b>: ${errores[propiedad].join('. ')}</li>`
            cuerpo += item;
        }
        cuerpo += "</ol>"
        let sao: SweetAlertOptions = {
            title: "Error De Validación",
            html: cuerpo,
            icon: "error"
        }
        this.sweetService.sweet_custom(sao);
    }

    getUsuarioActual() {
        return this.configService.getUsuarioValue();
    }

    /*CRUD */
    consultar<T>(id: any) {
        if (!this.validarPermiso('Consultar')) {
            this.errorPermiso("Consultar");
            return;
        }
        return this.http.get(this.urlEndPoint + `/${id}`).pipe(
            first(),
            map((response: any) => response as AguilaResponse<T>),
            map((response => response.aguilaData))
        );
    }

    crear(item: any) {
        if (!this.validarPermiso('Agregar')) {
            this.errorPermiso("Agregar");
            return;
        }
        this.sweetService.sweet_carga('Guardando Registro');
        return this.http.post(this.urlEndPoint, item).pipe(
            first()
        );
    }

    modificar(item: any) {
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

    /*Funciones de reportes */
    async generarPDFTabla(columnas: ColumnaTabla[], datos: any[], titulos: TitulosReporte, logo: string = "") {
        this.sweetService.sweet_carga('Generando Documento', true);
        try {
            let pdf: PdfMakeWrapper = new PdfMakeWrapper();
            let fecha = moment().format("DD-MM-YYYY HH:mm");
            let logoEmpresa;

            if (logo.length > 0) {
                logoEmpresa = await new Img(logo).width(45).alignment("center").build();
            } else {
                if (this.configService.getEstacionTrabajoV().sucursal.empresa.imagenLogo) {
                    logoEmpresa = await new Img(this.configService.getEstacionTrabajoV()
                        .sucursal.empresa.imagenLogo.imagenDefault.urlImagen)
                        .width(45).alignment("center").build();
                } else {
                    logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul)
                        .width(45).alignment("center").build();
                }
            }

            pdf.info({
                title: titulos.titulo.text,
                author: 'AguilaApp',
                subject: 'Reporte'
            });

            pdf.pageSize('LEGAL');//LETTER height = 735; tamaño = caracter * 8.5
            //pdf.pageSize({ width: 495.28, height: 'auto' });
            pdf.pageOrientation('landscape');

            pdf.header((currentPage: any) => {
                let header: any[] = [{
                    columns: [
                        { image: logoEmpresa.image, margin: [0, 5, 0, 0], width: 45 },
                        { text: titulos.titulo.text, fontSize: titulos.titulo.size, bold: titulos.titulo.bold, alignment: "center" }
                    ]
                }];
                return header;
            });

            let t = [];
            titulos.subTitulos.forEach((v, i) => {
                t.push({ text: v.text, bold: v.bold, alignment: "center", fontSize: v.size, margin: [0, -10, 0, 10] });
            });

            pdf.footer((currentPage: any, pageCount: any, pageSize: any) => {
                return [
                    {
                        columns: [
                            { text: `Generado por: ${this.configService.getUsuarioValue().nombre}`, margin: [10, 5, 10, 0], alignment: "left" },
                            { text: `Fecha y Hora de impresión: ${fecha}`, margin: [10, 5, 10, 0], alignment: "right" }
                        ]
                    },
                    {
                        columns: [{ text: `Página ${currentPage} de ${pageCount}`, alignment: (currentPage % 2) ? 'left' : 'right', margin: [10, 5, 10, 0] }]
                    }
                ]
            });
            let widths: number[] = [];
            widths = this.getWidths(columnas, 8.5, 735);
            let tabla = new Table([]).layout('lightHorizontalLines').headerRows(1).widths(widths).end;

            let encabezados = [];

            for (let columna of columnas) {
                if (columna.tipo != 'imagen' && columna.tipo != 'opcion' && columna.visible) {
                    let c = {
                        text: columna.titulo,
                        bold: true,
                        fillColor: '#000000',
                        color: '#FFFFFF',
                        alignment: columna.aligment || 'left',
                    }
                    encabezados.push(c);
                }
            }

            tabla.table.body.push(encabezados);

            for (let dato of datos) {
                let fila = []
                for (let columna of columnas) {
                    if (columna.tipo == "texto" && columna.visible) {
                        fila.push({
                            text: this.getDatoObjeto(dato, columna.target),
                            alignment: columna.aligment || 'left',
                        });
                    }

                    if (columna.tipo == "boolean" && columna.visible) {
                        fila.push({
                            text: this.getDatoObjeto(dato, columna.target) ? 'Si' : 'No',
                            alignment: columna.aligment || 'left'
                        });
                    }

                    if (columna.tipo == "fecha" && columna.visible) {
                        fila.push({
                            text: moment(this.getDatoObjeto(dato, columna.target)).isValid() ? moment(this.getDatoObjeto(dato, columna.target)).format(columna.formatoFecha || this.formatoFecha) : "",
                            alignment: columna.aligment || 'left'
                        });
                    }

                    if (columna.tipo == 'concatenar' && columna.visible) {
                        fila.push({
                            text: this.getDatoObjetoConcatenar(dato, columna.targetConcatenar, columna.caracterConcatenar),
                            alignment: columna.aligment || 'left'
                        });
                    }
                }
                encabezados.concat(fila);
                tabla.table.body.push(fila);
            }
            pdf.add(t);
            pdf.add(tabla);
            pdf.create().open();
            this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
        } catch (error) {
            console.log(error);
            this.sweetService.sweet_alerta('Error al generar el documento', 'No es posible generar el documento', 'error');
        }
    }

    async generarExcelTabla(columnas: ColumnaTabla[], datos: any[], titulos: TitulosReporte, logo: string = "") {
        this.sweetService.sweet_carga('Generando Documento', true);

        try {
            let workbook: Workbook = new Workbook();
            let fecha = moment().format("DD-MM-YYYY HH:mm");
            let logoEmpresa;

            //Cargamos el logo de la empresa
            if (logo.length > 0) {
                logoEmpresa = await new Img(logo).width(70).alignment("center").build();
            } else {
                if (this.configService.getEstacionTrabajoV().sucursal.empresa.imagenLogo) {
                    logoEmpresa = await new Img(this.configService.getEstacionTrabajoV()
                        .sucursal.empresa.imagenLogo.imagenDefault.urlImagen)
                        .width(70).alignment("center").build();
                } else {
                    logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul)
                        .width(70).alignment("center").build();
                }
            }

            let idLogoEmpresa = workbook.addImage({
                base64: logoEmpresa.image,
                extension: "jpeg"
            });

            //Asignamos Propiedades al Libro
            workbook.creator = 'AguilaApp';
            workbook.lastModifiedBy = this.configService.getUsuarioValue().username;
            workbook.created = new Date();
            workbook.modified = new Date();

            //Agregamos una Hoja de Trabajo
            workbook.addWorksheet("Reporte");
            let ws = workbook.getWorksheet('Reporte');

            //Configuracion de Página
            ws.pageSetup = {
                margins: {
                    left: 0.7,
                    right: 0.7,
                    top: 0.7,
                    bottom: 0.7,
                    header: 0.3,
                    footer: 0.3
                },
                orientation: 'landscape',
                paperSize: 5, //Papel Tamaño Oficio
            }

            //Header y Footer
            ws.headerFooter.oddHeader =
                `&L Fecha: ${fecha}` +
                `&R Generado por: ${this.configService.getUsuarioValue().username}`;
            ws.headerFooter.oddFooter = "&C Página &P de &N";

            //Contenido del documento
            ws.addRow([titulos.titulo.text]);

            titulos.subTitulos.forEach((v, i) => {
                ws.addRow([v.text])
            });

            ws.addImage(idLogoEmpresa, {
                tl: { col: 0, row: 0 },
                ext: { width: 45, height: 45 }
            });

            let headers = [];
            for (let columna of columnas) {
                if (columna.tipo !== 'opcion' && columna.tipo !== 'imagen' && columna.visible) {
                    headers.push({ name: columna.titulo, filterButton: true });
                }
            }

            let filas = [];
            for (let dato of datos) {
                let fila = []
                for (let columna of columnas) {
                    //Validamos si el contenido es un texto
                    if (columna.tipo == 'texto' && columna.visible) {
                        fila.push(this.getDatoObjeto(dato, columna.target));
                    }

                    //Validamos si el contenido es un booleano
                    if (columna.tipo == 'boolean' && columna.visible) {
                        fila.push(this.getDatoObjeto(dato, columna.target) ? 'Si' : 'No');
                    }

                    //Validamos si el contenido es una fecha
                    if (columna.tipo == 'fecha' && columna.visible) {
                        fila.push(moment(this.getDatoObjeto(dato, columna.target)).isValid() ? moment(this.getDatoObjeto(dato, columna.target)).format(columna.formatoFecha || this.formatoFecha) : "");
                    }

                    //Validamos si el contenido es una fecha
                    if (columna.tipo == 'concatenar' && columna.visible) {
                        fila.push(this.getDatoObjetoConcatenar(dato, columna.targetConcatenar, columna.caracterConcatenar));
                    }
                }
                filas.push(fila);
            }

            ws.addTable({
                name: "Tabla_1",
                ref: `A${titulos.subTitulos.length + 3}`,
                headerRow: true,
                totalsRow: false,
                style: {
                    theme: 'TableStyleLight1',
                },
                columns: headers,
                rows: filas
            });

            // ----- Aplicando Estilos ----- \\
            ws.mergeCells(1, 1, 1, headers.length); //Combinamos Celdas

            ws.getCell(1, 1).font = {
                bold: titulos.titulo.bold,
                size: titulos.titulo.size
            }

            ws.getCell(1, 1).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }

            titulos.subTitulos.forEach((v, i) => {
                ws.mergeCells(i + 2, 1, i + 2, headers.length); //Combinamos Celdas

                ws.getCell(i + 2, 1).font = {
                    bold: v.bold,
                    size: v.size
                }

                ws.getCell(i + 2, 1).alignment = {
                    vertical: 'middle',
                    horizontal: 'center'
                }
            });

            //Ajustamos el ancho de las columnas al contenido que tengan
            ws.columns.forEach((column, i) => {
                var maxLength = 30;
                var ancho = 10;
                column["eachCell"]({ includeEmpty: true }, function (cell) {
                    if (parseInt(cell.row) > titulos.subTitulos.length + 2) {
                        var columnLength = cell.value ? cell.value.toString().length : 10;
                        if (columnLength > ancho) {
                            ancho = columnLength;
                        }
                    }
                });
                column.width = ancho > maxLength ? 32 : ancho + 2;
            });

            // ----- Descargando Documento -----\\
            workbook.xlsx.writeBuffer().then(data => {
                let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                fs.saveAs(blob, `${titulos.titulo.text}.xlsx`);
                this.sweetService.sweet_alerta('Documento XLSX', 'Descargando Documento', 'info');
            });

        } catch (e) {
            console.log(e);
            this.sweetService.sweet_alerta('Error', 'No fue posible generar el documento', 'error');
        }
    }

    getWidths(columnas: ColumnaTabla[], factorConversion: number, anchoMax: number) {
        let widths: number[] = [];
        let maxWidth: number = (anchoMax / columnas.length);
        let totalWidths: number = 0;
        let noColMax: number = 0;

        columnas.forEach(c => {
            let palabras = c.titulo.split(" ");
            let w: number = 0;
            palabras.forEach(p => (p.length * factorConversion) > w ? w = (p.length * factorConversion) : w = w);
            widths.push(w);
            totalWidths += w;
        });

        if (totalWidths > anchoMax) {
            let difWidth: number = 0;
            widths.forEach(w => {
                if (w > maxWidth) noColMax++;
                difWidth = totalWidths - anchoMax;
            });
            let difXCol: number = difWidth / noColMax;
            widths = widths.map(w => (w > maxWidth) ? w -= difXCol : w);
        } else {
            let difXCol: number = (anchoMax - totalWidths) / columnas.length;
            widths = widths.map(w => w += difXCol);
        }
        return widths;
    }

    getDatoObjeto(item: any, target: string[]) {
        if (item) {
            let n = item;
            target.forEach(i => {
                n = n[i] ? n[i] : "";
            });
            return n;
        }
        return "";
    }

    getDatoObjetoConcatenar(item: any, target: string[][], caracterConcatenar: string) {
        let s: string = "";
        if (item) {
            target.forEach(t => {
                let n = item;
                t.forEach(i => {
                    n = n[i] ? n[i] : "";
                });
                s += n.toString().trim();
                s += caracterConcatenar;
            });
        }
        return s;
    }

    async descargarImagen(imagen: Imagen) {
        let img = await new Img(imagen.urlImagen).build();

        let link = document.createElement("a");
        link.href = img.image;
        link.download = imagen.nombre;
        link.target = "_blank";
        link.click();
        link.remove();
    }
}