import { Direccion } from './direccion';
export class EntidadComercial {
    id?: number;
    idDireccionFiscal?: number;
    idCorporacion:number;
    nombre: string;
    razonSocial: string;
    tipo: string;
    nit: string;
    tipoNit: string; //Proviene de listado
    fechaCreacion: Date;
    direccionFiscal?: Direccion;
}