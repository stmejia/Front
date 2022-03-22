import { Sucursal } from "./sucursal";
import { Recurso } from './recurso';

export class Estaciontrabajo {
  id?: number; //No se tiene que setear el id
  sucursalId: number;
  tipo: string; //Enviar el nombre de tipo
  codigo: string; //10 Caracteres Max
  nombre: string; //40 Caracteres Max
  activa: boolean;
  fchCreacion: Date;
  sucursal: Sucursal;
  recursos: Recurso[];
}
