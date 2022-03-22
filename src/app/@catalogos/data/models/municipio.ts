import { Departamento } from "./departamento";

export class Municipio {
    id?: number;
    idDepartamento: number;
    departamento: Departamento;
    codMunicipio: string;
    nombreMunicipio: string;
    fechaCreacion?: Date;
}

export class CodigoPostal {
    id: number;
    idMunicipio: number;
    codigo: string;
    municipio?: Municipio;
}