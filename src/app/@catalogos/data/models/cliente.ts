import { EntidadComercial } from './entidadComercial';
import { Direccion } from './direccion';

export class Cliente {
    id?: number;
    idTipoCliente: number;
    codigo:string;
    //idCorporacion: number;
    idDireccion?: number; //Lo setea el EndPoint
    direccion: Direccion;
    idEntidadComercial?: number; //Lo setea el EndPoint
    direccionFiscal:Direccion;
    entidadComercial: EntidadComercial;
    diasCredito: number;
    fechaBaja?: Date;
    fechaCreacion?: Date;
}