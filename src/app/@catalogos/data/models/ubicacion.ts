import { Municipio } from './municipio';
import { Departamento } from './departamento';
import { Pais } from './pais';

export class Ubicacion {
    id?: number;
    codigo: string;
    idPais:number;
    idDepartamento:number;
    idMunicipio: number;
    esPuerto: boolean;
    lugar: string;
    codigoPostal: string;
    paises:Pais[];
    latitud?: number;
    longitud?: number;
    departamentos: Departamento[];
    municipios: Municipio[];
    fechaCreacion: Date;
}