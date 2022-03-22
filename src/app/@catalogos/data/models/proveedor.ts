import { Direccion } from "./direccion";
import { EntidadComercial } from "./entidadComercial";

export class Proveedor {
    id?: number;
    codigo: string;
    idTipoProveedor: number;
    //idCorporacion: number;
    idEmpresa: number;
    entidadComercial: EntidadComercial;
    direccion: Direccion;
    direccionFiscal: Direccion;
    vDireccion?: string;
    vDireccionFiscal?: string;
    idEntidadComercial?: number;
    fechaCreacion?: Date;

}