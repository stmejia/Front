import { ActivoOperaciones } from "./activoOperaciones";

export interface Llanta {
    id: number;
    proveedorId: number;
    idLlantaTipo: number;
    codigo: string;
    marca: string;
    serie: string;
    reencaucheIngreso: string;
    precio: number;
    propositoIngreso: String;
    fechaIngreso: Date;
    fechaBaja: Date;
    fechaCreacion: Date;
}