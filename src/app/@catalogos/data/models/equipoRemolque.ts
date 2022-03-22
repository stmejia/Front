import { ImagenRecurso } from "src/app/@aguila/data/models/imagenRecurso";
import { ActivoOperaciones } from "./activoOperaciones";
import { TipoEquipoRemolque } from "./tipoEquipoRemolque";

export interface EquipoRemolque {
    idActivo: number;
    idTipoEquipoRemolque: number;
    noEjes: string,
    tandemCorredizo: string,
    chasisExtensible: string,
    tipoCuello: string,
    acopleGenset: string,
    acopleDolly: string,
    capacidadCargaLB: string,
    medidaPlataforma: string,
    tarjetaCirculacion: string,
    placa: string,
    pechera: string,
    alturaContenedor: string,
    tipoContenedor: string,
    marcaUR: string,
    largoFurgon: string,
    rielesHorizontales: string,
    rielesVerticales: string,
    activoOperacion?: ActivoOperaciones;
    tipoEquipoRemolque?: TipoEquipoRemolque;
    imagenTarjetaCirculacion?: ImagenRecurso;
}