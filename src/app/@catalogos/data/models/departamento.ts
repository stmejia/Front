import { Pais } from "./pais";

export class Departamento {
    id?: number;
    idPais: number;
    pais: Pais;
    codigo: string;
    nombre: string;
    fechaCreacion?: Date;
}