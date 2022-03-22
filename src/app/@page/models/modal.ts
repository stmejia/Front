import { Imagen } from "src/app/@aguila/data/models/imagen";
import { ColumnaTabla } from "./aguilaTabla";
import { FiltrosC, QueryFilter } from "./filtros";

export interface TablaModalData {
    titulo?: string;
    filtros: FiltrosC[];
    filtrosObligatorios: QueryFilter[];
    endPoint: string;
    columnas: ColumnaTabla[];
    selectMultiple: boolean;
}

export interface QRDataModal {
    controlador: string,
    campo: string
}

export interface VisorImagenesModal {
    titulo: string;
    imagenes: Imagen[];
}