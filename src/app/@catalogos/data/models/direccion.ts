import { Municipio } from "./municipio";

export class Direccion {
    id?: number;
    idMunicipio: number;
    idDepartamento?: number;
    idPais?: number;
    municipio: Municipio;
    colonia: string;
    zona: string;
    codigoPostal: string;
    direccion: string;
    fechaCreacion?: Date;
}