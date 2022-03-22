import { Direccion } from "./direccion";

export class EntidadComercialDireccion {
    id?: number;
    idEntidadComercial: number;
    idDireccion: number;
    direccion?: Direccion;
    vDireccion?: string;
    descripcion: string;
    fechaCreacion?: Date;
}