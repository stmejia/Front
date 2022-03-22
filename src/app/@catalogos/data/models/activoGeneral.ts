export class ActivoGeneral {
    id?: number;
    codigo?: string;
    descripcion?: string;
    fechaCompra: string;
    valorCompra: number;
    valorLibro: number;
    valorRescate: number;
    fechaBaja: Date;
    depreciacionAcumulada: number;
    idDocumentoCompra: number;
    idTipoActivo: number;
    tituloPropiedad: string;
    polizaImportacion: string;
    fechaCreacion?: Date;
}